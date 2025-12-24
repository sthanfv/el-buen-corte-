import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { verifyAdmin } from '@/lib/auth-server';

export async function POST(req: NextRequest) {
  try {
    if (!(await verifyAdmin(req))) {
      return NextResponse.json(
        { error: 'Acceso denegado: Privilegios insuficientes' },
        { status: 403 }
      );
    }

    // Recuperamos el token para trazabilidad (updatedBy)
    const idToken = req.headers.get('Authorization')!.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    const { id, updates } = await req.json();

    if (!id || !updates) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    // ✅ SECURITY: Immutability Check
    const orderRef = adminDb.collection('orders').doc(id);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    const currentOrder = orderSnap.data();
    let currentStatus = (currentOrder?.status || 'CREATED').toUpperCase();

    // Mapeo legado: pending -> WAITING_PAYMENT
    if (currentStatus === 'PENDING' || currentStatus === 'PENDING_VERIFICATION')
      currentStatus = 'WAITING_PAYMENT';

    const { status: rawNextStatus, transactionId, notes } = updates;
    const nextStatus = rawNextStatus?.toUpperCase();

    // ✅ FSM FLEXIBLE (MANDATO-FILTRO): Administradores pueden saltar estados
    // Solo impedimos transiciones desde estados terminales (DELIVERED, CANCELLED...)
    const terminalStatuses = ['DELIVERED', 'CANCELLED', 'CANCELLED_TIMEOUT'];

    if (nextStatus && nextStatus !== currentStatus) {
      if (terminalStatuses.includes(currentStatus)) {
        return NextResponse.json(
          {
            error: `No se puede modificar un pedido en estado terminal: ${currentStatus}`,
          },
          { status: 400 }
        );
      }

      // ✅ REGLA DE NEGOCIO: Conciliación financiera obligatoria al confirmar pago
      if (
        nextStatus === 'PAID_VERIFIED' &&
        !transactionId &&
        !currentOrder?.transactionId
      ) {
        return NextResponse.json(
          {
            error:
              'Se requiere un código de transacción para verificar el pago',
          },
          { status: 400 }
        );
      }
    }

    // Sanitize updates
    const sanitizedUpdates: any = {};
    if (nextStatus) sanitizedUpdates.status = nextStatus;
    if (transactionId) sanitizedUpdates.transactionId = transactionId;
    if (notes) sanitizedUpdates.notes = notes;

    // ✅ AUDITORÍA: Registro de transición e historial
    const now = new Date();
    const nowMs = now.getTime();

    const historyItem = {
      status: nextStatus || currentStatus, // Legacy support
      timestamp: now.toISOString(), // Legacy support

      // ✅ MANDATO-FILTRO: Trazabilidad exacta
      at: nowMs,
      from: currentStatus,
      to: nextStatus || currentStatus,
      by: 'admin', // Or decodedToken.email if available, but 'admin' requested
      userId: decodedToken.uid, // Internal tracking

      isManualOverride: true,
      durationMs: currentOrder?.updatedAt
        ? nowMs - new Date(currentOrder.updatedAt).getTime()
        : 0,
    };

    sanitizedUpdates.updatedAt = now.toISOString();
    sanitizedUpdates.updatedBy = decodedToken.uid;

    // ✅ Lógica de cierre de ciclo
    if (nextStatus === 'DELIVERED' && currentStatus !== 'DELIVERED') {
      sanitizedUpdates.deliveredAt = now.toISOString();
    }

    // Usamos arrayUnion para no sobreescribir el historial
    const { admin } = require('firebase-admin'); // Import dynamic if needed or use adminDb
    const firebaseAdmin = require('firebase-admin');

    await orderRef.update({
      ...sanitizedUpdates,
      history: firebaseAdmin.firestore.FieldValue.arrayUnion(historyItem),
    });

    logger.info('Order updated by admin', {
      orderId: id,
      adminUid: decodedToken.uid,
      updates: Object.keys(sanitizedUpdates),
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    logger.error('Unexpected error in order update', { error: e.message || e });
    // ✅ SECURITY: Precise error handling
    if (e.code === 'permission-denied') {
      return NextResponse.json(
        { error: 'Permisos insuficientes en base de datos' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: 'Error al actualizar el pedido' },
      { status: 500 }
    );
  }
}
