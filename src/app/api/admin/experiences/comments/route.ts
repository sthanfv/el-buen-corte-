import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { verifyAdmin } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
    if (!await verifyAdmin(request)) {
        return NextResponse.json({ error: 'Acceso denegado: Privilegios insuficientes' }, { status: 403 });
    }

    try {
        const snapshot = await adminDb.collection('experience_comments').orderBy('createdAt', 'desc').get();
        const comments = snapshot.docs.map(doc => doc.data());
        return NextResponse.json(comments);
    } catch (error) {
        logger.error('Error fetching experience comments', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
