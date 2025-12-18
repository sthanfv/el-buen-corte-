import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    if (!id) {
        return NextResponse.json({ error: 'ID de pedido requerido' }, { status: 400 });
    }

    try {
        const doc = await adminDb.collection('orders').doc(id).get();

        if (!doc.exists) {
            return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
        }

        const orderData = doc.data()!;

        // ✅ SECURITY: Blind non-essential fields for public access
        // Only return status, items (names), and date
        return NextResponse.json({
            id: doc.id,
            status: orderData.status,
            createdAt: orderData.createdAt,
            items: orderData.items.map((i: any) => i.name),
            total: orderData.total,
        });

    } catch (error) {
        logger.error('Order status lookup failed', { orderId: id, error });
        return NextResponse.json({ error: 'Error al consultar el estado' }, { status: 500 });
    }
}
