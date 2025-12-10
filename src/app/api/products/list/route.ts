import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Reference to 'products' collection
    const snapshot = await adminDb.collection('products').get();

    // 2. Map and validation
    const products = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Ensure critical fields exist or fallback
        stock: data.stock ?? 0,
        images: data.images || [],
      };
    });

    // 3. Filter strictly for public view if needed (e.g. active only)
    // For now, return all (user requirement: see real products)

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Error interno al obtener el catálogo.' },
      { status: 500 }
    );
  }
}
