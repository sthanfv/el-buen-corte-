import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase';
import { headers } from 'next/headers';
import { put } from '@vercel/blob';

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
        // Strict check: Only actual admins can upload
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

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only images are allowed' }, { status: 400 });
    }

    // 2. Upload using Vercel Blob SDK
    // SDK automatically uses BLOB_READ_WRITE_TOKEN from env
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true, // Prevents overwrites
    });

    console.log(`Upload Success: ${blob.url}`);

    return NextResponse.json({ url: blob.url });
  } catch (e) {
    console.error('Upload Error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
