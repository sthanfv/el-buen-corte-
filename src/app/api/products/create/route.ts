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

    const body = await req.json();
    const validatedData = ProductSchema.parse(body);

    const ref = await adminDb.collection('products').add({
      ...validatedData,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ id: ref.id });
  } catch (e: any) {
    if (e.name === 'ZodError') {
      return NextResponse.json({ error: 'Datos de producto inválidos' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Error al crear el producto' },
      { status: 500 }
    );
  }
}
