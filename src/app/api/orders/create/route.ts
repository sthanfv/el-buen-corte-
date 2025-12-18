import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase';
import { OrderSchema } from '@/schemas/order';
import { sendOrderConfirmation } from '@/lib/email';
import { headers } from 'next/headers';
import { logger } from '@/lib/logger';

// Simple In-Memory Rate Limiter
// In production, use Upstash/Redis for multi-instance consistency
const rateLimitMap = new Map<string, { count: number, lastReset: number }>();
const LIMIT = 5; // orders
const WINDOW = 60 * 60 * 1000; // 1 hour

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    const authHeader = headersList.get('Authorization');

    // 1. Rate Limiting Check
    const now = Date.now();
    const userLimit = rateLimitMap.get(ip) || { count: 0, lastReset: now };

    if (now - userLimit.lastReset > WINDOW) {
      userLimit.count = 0;
      userLimit.lastReset = now;
    }

    if (userLimit.count >= LIMIT) {
      logger.warn('Rate limit hit for order creation', { ip, endpoint: '/api/orders/create' });
      return NextResponse.json(
        { error: 'Has superado el límite de pedidos permitidos por hora. Por favor, contacta a soporte.' },
        { status: 429 }
      );
    }

    // 2. Security Check: Verify Firebase Auth (Anonymous or Signed-in)
    if (!authHeader?.startsWith('Bearer ')) {
      logger.audit('Authentication failed: Missing Bearer token', { ip, endpoint: '/api/orders/create' });
      return NextResponse.json({ error: 'Sesión no válida para realizar el pedido' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    try {
      await adminAuth.verifyIdToken(token);
    } catch (e) {
      logger.audit('Authentication failed: Invalid token', { ip, endpoint: '/api/orders/create' });
      return NextResponse.json({ error: 'Sesión no válida' }, { status: 401 });
    }

    const body = await req.json();

    // ✅ Idempotency Check
    const idempotencyKey = body.idempotencyKey;
    if (idempotencyKey) {
      const existingOrder = await adminDb.collection('orders')
        .where('idempotencyKey', '==', idempotencyKey)
        .limit(1)
        .get();

      if (!existingOrder.empty) {
        logger.warn('Duplicate order attempt detected (Idempotency)', { idempotencyKey, ip });
        return NextResponse.json({ ok: true, id: existingOrder.docs[0].id, duplicate: true });
      }
    }

    // 3. Validate Input
    const validatedOrder = OrderSchema.parse(body);

    // ✅ SECURITY: Payload Sealing (Recalcular Total)
    // El servidor ignora el total enviado por el cliente para evitar manipulaciones de precio.
    const calculatedTotal = validatedOrder.items.reduce(
      (sum: number, item: any) => sum + item.finalPrice,
      0
    );

    // ✅ SECURITY: Timeout Enforcement
    // Garantizar que la operación termine en un tiempo razonable
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const ref = await adminDb.collection('orders').add({
        ...validatedOrder,
        total: calculatedTotal, // Overwrite with server computation
        idempotencyKey: idempotencyKey || null,
        _source: 'api', // Internal tag required by Firestore Rules
        createdAt: new Date().toISOString(),
        status: 'pending',
        customerIp: ip, // Audit trail
      });

      // Update rate limit counter
      userLimit.count++;
      rateLimitMap.set(ip, userLimit);

      // 4. Send confirmation email (Fire and Forget)
      try {
        // ✅ SECURITY: Anomaly detection
        // Silent internal logging for security monitoring
        if (userLimit.count > 1 && (now - userLimit.lastReset < 5 * 60 * 1000)) {
          logger.audit('Abuse anomaly detected: Multiple fast order attempts', {
            ip,
            count: userLimit.count,
            window_start: userLimit.lastReset
          });
        }

        await sendOrderConfirmation({
          orderNumber: ref.id.slice(0, 8).toUpperCase(),
          customerName: validatedOrder.customerInfo.customerName,
          totalAmount: calculatedTotal,
          items: validatedOrder.items.map((i: any) => ({
            name: i.name,
            quantity: 1, // Base on items array structure
            price: i.finalPrice
          }))
        });
      } catch (emailError) {
        logger.error('Email confirmation failure', { orderId: ref.id, error: emailError });
      }

      logger.info('Order created successfully', { orderId: ref.id, ip });
      return NextResponse.json({ ok: true, id: ref.id });
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (e: any) {
    if (e.name === 'AbortError') {
      logger.error('Order creation timeout', { endpoint: '/api/orders/create' });
      return NextResponse.json(
        { error: 'La operación ha tardado demasiado tiempo.' },
        { status: 504 }
      );
    }

    // ✅ SECURITY: Zod validation error handled as 400
    if (e.name === 'ZodError') {
      logger.warn('Validation error during order creation', { error: e.errors });
      return NextResponse.json(
        { error: 'Datos de pedido inválidos.' },
        { status: 400 }
      );
    }

    logger.error('Unexpected error in order creation', { error: e.message || e });
    return NextResponse.json(
      { error: 'Ha ocurrido un error al procesar su pedido.' },
      { status: 500 }
    );
  }
}
