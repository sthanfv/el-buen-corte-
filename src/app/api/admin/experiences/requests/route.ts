import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { verifyAdmin } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
    if (!await verifyAdmin(request)) {
        return NextResponse.json({ error: 'Acceso denegado: Privilegios insuficientes' }, { status: 403 });
    }

    try {
        const snapshot = await adminDb.collection('experience_requests').orderBy('createdAt', 'desc').get();
        const requests = snapshot.docs.map(doc => doc.data());
        return NextResponse.json(requests);
    } catch (error) {
        logger.error('Error fetching experience requests', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
