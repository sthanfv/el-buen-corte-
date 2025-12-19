import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { verifyAdmin } from '@/lib/auth-server';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    if (!await verifyAdmin(request)) {
        return NextResponse.json({ error: 'Acceso denegado: Privilegios insuficientes' }, { status: 403 });
    }
    const { id: ip } = params; // The ID is the IP

    let action = 'procesar';
    try {
        const body = await request.json();
        action = body.action;
        const status = action === 'approve' ? 'approved' : 'rejected';

        await adminDb.collection('experience_requests').doc(ip).update({
            status,
            updatedAt: new Date().toISOString(),
        });

        logger.info(`Administrador ${action} solicitud de IP: ${ip}`);
        return NextResponse.json({ message: `Solicitud ${status} con éxito.` });
    } catch (error) {
        logger.error(`Error al ${action} solicitud de experiencia`, error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
