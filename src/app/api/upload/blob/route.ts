import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase';
import { headers } from 'next/headers';
import { put } from '@vercel/blob';
import { logger } from '@/lib/logger';

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
  try {
    // 1. Security Check: Verify Admin Token
    const headersList = await headers();
    const authorization = headersList.get('Authorization');
    const ip = headersList.get('x-forwarded-for') || 'unknown';

    if (!authorization?.startsWith('Bearer ')) {
      logger.audit('Unauthorized upload attempt: Missing token', { ip, endpoint: '/api/upload/blob' });
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const idToken = authorization.split('Bearer ')[1];

    try {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      if (decodedToken.admin !== true) {
        // ✅ SECURITY: Strict check: Only actual admins can upload
        logger.audit('Forbidden upload attempt: Non-admin user', { ip, uid: decodedToken.uid, endpoint: '/api/upload/blob' });
        return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
      }
    } catch (authError) {
      logger.audit('Unauthorized upload attempt: Invalid token', { ip, endpoint: '/api/upload/blob' });
      return NextResponse.json(
        { error: 'Sesión inválida o expirada' },
        { status: 401 }
      );
    }

    const data = await req.formData();
    const file = data.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 });
    }

    // ✅ SECURITY: Strict MIME type validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      logger.warn('Blocked file upload: Invalid MIME type', { type: file.type, ip });
      return NextResponse.json({
        error: `Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG, WEBP, GIF).`
      }, { status: 400 });
    }

    // ✅ SECURITY: File size limit (5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      logger.warn('Blocked file upload: Size limit exceeded', { size: file.size, ip });
      return NextResponse.json({
        error: `El archivo es demasiado grande. Máximo permitido: 5MB.`
      }, { status: 400 });
    }

    // 2. Upload using Vercel Blob SDK
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    logger.info('File uploaded successfully', { url: blob.url, ip });
    return NextResponse.json({ url: blob.url });
  } catch (e) {
    // ✅ SECURITY: Sanitize error response
    logger.error('Unexpected error in upload API', { error: e });
    return NextResponse.json({ error: 'Error interno al procesar la carga de imagen' }, { status: 500 });
  }
}
