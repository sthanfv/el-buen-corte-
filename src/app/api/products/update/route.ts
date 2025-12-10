import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase';
import { headers } from 'next/headers';
import { ProductSchema } from '@/schemas/product';

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

    const { id, data } = await req.json();

    if (!id || !data) {
      return NextResponse.json(
        { error: 'Product ID and data are required' },
        { status: 400 }
      );
    }

    // Validate partial update
    const validatedData = ProductSchema.partial().parse(data);

    await adminDb.collection('products').doc(id).update(validatedData);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('Error in /api/products/update:', e);
    return NextResponse.json(
      { error: e.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}
