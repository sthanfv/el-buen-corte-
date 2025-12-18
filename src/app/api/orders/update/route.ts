import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase';
import { headers } from 'next/headers';
import { logger } from '@/lib/logger';

export async function POST(req: Request) {
    try {
        const headersList = await headers();
        const authorization = headersList.get('Authorization');
        const ip = headersList.get('x-forwarded-for') || 'unknown';

        if (!authorization?.startsWith('Bearer ')) {
            logger.audit('Unauthorized order update attempt: Missing token', { ip, endpoint: '/api/orders/update' });
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        const idToken = authorization.split('Bearer ')[1];
        let decodedToken;
        try {
            decodedToken = await adminAuth.verifyIdToken(idToken);
        } catch (e) {
            logger.audit('Unauthorized order update attempt: Invalid token', { ip, endpoint: '/api/orders/update' });
            return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
        }

        if (decodedToken.admin !== true) {
            logger.audit('Forbidden order update attempt: Non-admin user', { ip, uid: decodedToken.uid, endpoint: '/api/orders/update' });
            return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
        }

        const { id, updates } = await req.json();

        if (!id || !updates) {
            return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
        }

        // ✅ SECURITY: Immutability Check
        const orderRef = adminDb.collection('orders').doc(id);
        const orderSnap = await orderRef.get();

        if (!orderSnap.exists) {
            return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
        }

        const currentOrder = orderSnap.data();
        const terminalStates = ['confirmed', 'preparing', 'delivered', 'cancelled'];

        // If order is in a terminal or advanced state, restrict what can be changed
        if (currentOrder && terminalStates.includes(currentOrder.status)) {
            // Only allow updating internal notes or specific admin flags if needed
            // But block changing the main status backwards or items (though items aren't in allowedFields anyway)
            const restrictedFields = ['status']; // For example, can't change status once delivered
            if (currentOrder.status === 'delivered' && updates.status) {
                logger.warn('Blocked terminal state update', { orderId: id, currentStatus: currentOrder.status, requestedStatus: updates.status, adminUid: decodedToken.uid });
                return NextResponse.json({ error: 'No se puede cambiar el estado de un pedido entregado' }, { status: 400 });
            }
        }

        // Sanitize updates - only allow specific fields
        const allowedFields = ['status', 'notes', 'internalStatus'];
        const sanitizedUpdates: any = {};
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                sanitizedUpdates[field] = updates[field];
            }
        });

        sanitizedUpdates.updatedAt = new Date().toISOString();
        sanitizedUpdates.updatedBy = decodedToken.uid; // Traceability

        await orderRef.update(sanitizedUpdates);

        logger.info('Order updated by admin', { orderId: id, adminUid: decodedToken.uid, updates: Object.keys(sanitizedUpdates) });
        return NextResponse.json({ success: true });
    } catch (e: any) {
        logger.error('Unexpected error in order update', { error: e.message || e });
        // ✅ SECURITY: Precise error handling
        if (e.code === 'permission-denied') {
            return NextResponse.json({ error: 'Permisos insuficientes en base de datos' }, { status: 403 });
        }
        return NextResponse.json({ error: 'Error al actualizar el pedido' }, { status: 500 });
    }
}
