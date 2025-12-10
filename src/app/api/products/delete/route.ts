import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase';
import { headers } from 'next/headers';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const authorization = headersList.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authorization.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    if (decodedToken.admin !== true) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();

    // Validate ID
    const DeleteSchema = z.object({
      id: z.string().min(1, 'Product ID is required'),
    });

    const { id } = DeleteSchema.parse(body);

    await adminDb.collection('products').doc(id).delete();

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('Error in /api/products/delete:', e);
    return NextResponse.json(
      { error: e.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}
