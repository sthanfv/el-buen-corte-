import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase';
import { headers } from 'next/headers';
import { ProductSchema } from '@/schemas/product';
import { logAdminAction } from '@/lib/audit-logger';

// ✅ SECURITY: Force dynamic rendering (no caching of sensitive data)
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // ✅ SECURITY: Validate Authorization header
    const headersList = await headers();
    const authorization = headersList.get('Authorization');

    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const idToken = authorization.split('Bearer ')[1];

    // ✅ SECURITY: Verify token and admin claim
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (tokenError) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 401 }
      );
    }

    if (decodedToken.admin !== true) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    // ✅ SECURITY: Parse and validate request body
    const body = await req.json();
    const { id, data } = body;

    // ✅ SECURITY: Validate required fields
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'ID de producto requerido y debe ser string' },
        { status: 400 }
      );
    }

    // ✅ SECURITY: Sanitize ID (prevent injection)
    const sanitizedId = id.trim().substring(0, 50);
    if (!/^[a-zA-Z0-9_-]+$/.test(sanitizedId)) {
      return NextResponse.json(
        { error: 'ID de producto inválido' },
        { status: 400 }
      );
    }

    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Datos de producto requeridos' },
        { status: 400 }
      );
    }

    // ✅ SECURITY: Validate against schema (partial for updates)
    let validatedData;
    try {
      validatedData = ProductSchema.partial().parse(data);
    } catch (validationError) {
      return NextResponse.json(
        { error: 'Datos de producto inválidos' },
        { status: 400 }
      );
    }

    // ✅ SECURITY: Check if product exists before updating
    const docRef = adminDb.collection('products').doc(sanitizedId);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // ✅ SECURITY: Add update metadata
    await docRef.update({
      ...validatedData,
      updatedAt: new Date().toISOString(),
      updatedBy: decodedToken.uid, // Audit trail
    });

    // ✅ AUDIT LOG (Phase 2)
    await logAdminAction({
      actorId: decodedToken.uid,
      action: 'PRODUCT_UPDATE',
      targetId: sanitizedId,
      before: { status: 'existing_data_not_fetched_for_perf' }, // Minimizing reads
      after: validatedData,
      ip: headersList.get('x-forwarded-for') || 'unknown',
      userAgent: headersList.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      ok: true,
      id: sanitizedId,
    });
  } catch (e: unknown) {
    // ✅ SECURITY: Don't expose error details in production
    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
      // Development only: log to server console
      console.error('[API ERROR] /api/products/update:', e);
    }

    // Generic error for client
    return NextResponse.json(
      { error: 'Error al actualizar el producto' },
      { status: 500 }
    );
  }
}
