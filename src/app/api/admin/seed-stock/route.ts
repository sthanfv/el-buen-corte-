import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase';
import { verifyAdmin } from '@/lib/auth-server';
import { logger } from '@/lib/logger';

/**
 * API: /api/admin/seed-stock
 * Inicializa el stock de los productos para la fase de integridad ACID.
 * Protocolo: MANDATO-FILTRO.
 */
export async function POST(req: NextRequest) {
    try {
        if (!await verifyAdmin(req)) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const snapshot = await adminDb.collection('products').get();
        const batch = adminDb.batch();

        snapshot.docs.forEach(doc => {
            // Asignamos un stock de 10 unidades por defecto para demo
            batch.update(doc.ref, {
                stock: 10,
                updatedAt: new Date().toISOString()
            });
        });

        await batch.commit();

        logger.audit('Inventario inicializado (Seed Stock)', { count: snapshot.size });
        return NextResponse.json({ success: true, message: `Stock actualizado para ${snapshot.size} productos.` });
    } catch (error) {
        logger.error('Error in seed-stock', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
