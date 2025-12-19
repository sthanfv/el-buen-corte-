import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { verifyAdmin } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
    if (!await verifyAdmin(request)) {
        return NextResponse.json({ error: 'Acceso denegado: Privilegios insuficientes' }, { status: 403 });
    }

    try {
        const { ip, reason } = await request.json();

        if (!ip) return NextResponse.json({ error: 'IP requerida' }, { status: 400 });

        await adminDb.collection('banned_ips').doc(ip).set({
            ip,
            reason: reason || 'Abuso del sistema / Spam',
            bannedAt: new Date().toISOString(),
        });

        logger.warn(`IP BANEADA: ${ip}. Motivo: ${reason}`);

        return NextResponse.json({ message: 'IP bloqueada con éxito.' });
    } catch (error) {
        logger.error('Error al banear IP', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    if (!await verifyAdmin(request)) {
        return NextResponse.json({ error: 'Acceso denegado: Privilegios insuficientes' }, { status: 403 });
    }
    try {
        const snapshot = await adminDb.collection('banned_ips').get();
        const bannedIps = snapshot.docs.map(doc => doc.id);
        return NextResponse.json(bannedIps);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
