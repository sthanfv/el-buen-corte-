import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase';
import { verifyAdmin } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  try {
    if (!await verifyAdmin(req)) {
      return NextResponse.json({ error: 'Acceso denegado: Privilegios insuficientes' }, { status: 403 });
    }

    const snapshot = await adminDb
      .collection('orders')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
    const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(orders);
  } catch (e: any) {
    console.error('Error listing orders:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
