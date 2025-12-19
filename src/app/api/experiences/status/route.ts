import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase';

export async function GET(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        '127.0.0.1';

    try {
        const doc = await adminDb.collection('experience_requests').doc(ip).get();
        if (!doc.exists) {
            return NextResponse.json({ status: 'none' });
        }
        return NextResponse.json({ status: doc.data()?.status });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
