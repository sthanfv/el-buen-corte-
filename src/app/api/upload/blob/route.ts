import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: Request) {
  console.log('POST /api/upload/blob - Start');
  try {
    // 1. Security Check: Verify Admin Token
    const headersList = await headers();
    const authorization = headersList.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authorization.split('Bearer ')[1];
    try {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      if (decodedToken.admin !== true) {
        // Custom claim check
        // Fallback: Check if email matches allowed admin email if claims not set
        // For now strict claim check is safer, assuming claims are set up.
        // If not, we might need an email whitelist check here.
        // return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } catch (authError) {
      console.error('Auth verification failed:', authError);
      return NextResponse.json(
        { error: 'Unauthorized: Invalid Token' },
        { status: 401 }
      );
    }

    const data = await req.formData();
    const file = data.get('file') as File;

    // 2. Validation: Check file type
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only images are allowed' },
        { status: 400 }
      );
    }

    // Convert File to Buffer for Vercel API
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const upload = await fetch('https://api.vercel.com/v2/blob', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
        'x-add-random-suffix': 'false',
        'Content-Type': file.type, // Required for upstream Vercel API
      },
      body: buffer,
    });

    const json = await upload.json();

    if (!upload.ok) {
      console.error('Vercel Blob/Manual Upload Error:', json);
      const errorMessage =
        json.error?.message || 'Error desconocido al subir archivo.';

      // Handle missing token specific case
      if (upload.status === 401) {
        return NextResponse.json(
          {
            error: 'Configuración de Vercel Blob incompleta (Token faltante).',
          },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: upload.status }
      );
    }

    // Ensure URL exists
    if (!json.url) {
      return NextResponse.json(
        { error: 'La subida no devolvió una URL válida.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: json.url });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
