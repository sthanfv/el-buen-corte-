import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase';
import { CommentSchema } from '@/schemas/experience';
import { logger } from '@/lib/logger';
import { hasProfanity, filterProfanity } from '@/lib/profanity-filter';
import { fullSanitize } from '@/lib/sanitizer';

export async function POST(request: NextRequest) {
    try {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
            request.headers.get('x-real-ip') ||
            '127.0.0.1';

        // 1. SECURITY CHECK: Banned IP
        const banDoc = await adminDb.collection('banned_ips').doc(ip).get();
        if (banDoc.exists) {
            return NextResponse.json({
                error: 'ACCESO BLOQUEADO. Tu conexión ha sido restringida por mal uso.'
            }, { status: 403 });
        }

        // 2. SECURITY CHECK: Verify if the IP is approved
        const requestDoc = await adminDb.collection('experience_requests').doc(ip).get();

        if (!requestDoc.exists || requestDoc.data()?.status !== 'approved') {
            return NextResponse.json({
                error: 'Acceso denegado. Debes reservar un lugar y ser aprobado por el administrador para comentar.'
            }, { status: 403 });
        }

        // 3. RATE LIMITING: 1 comment every 10 minutes
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
        const recentComments = await adminDb.collection('experience_comment_logs')
            .where('ip', '==', ip)
            .where('createdAt', '>', tenMinutesAgo)
            .get();

        if (!recentComments.empty) {
            return NextResponse.json({
                error: 'Demasiado rápido. Solo puedes publicar una experiencia cada 10 minutos.'
            }, { status: 429 });
        }

        const userData = requestDoc.data();
        const authorName = userData?.fullName || 'Anónimo';

        const body = await request.json();

        // Validation with Zod
        const validation = CommentSchema.safeParse(body);
        if (!validation.success) {
            const errorMsg = Object.values(validation.error.flatten().fieldErrors).flat().join(', ');
            return NextResponse.json({ error: errorMsg || 'Comentario inválido' }, { status: 400 });
        }

        const { content, rating, category, productId, imageUrl } = validation.data;

        // 4. SECURITY: Profanity Filter & XSS Sanitization
        if (hasProfanity(content)) {
            return NextResponse.json({
                error: 'Tu mensaje contiene lenguaje inapropiado. Por favor mantén el respeto para ser aprobado.'
            }, { status: 400 });
        }

        const filteredContent = filterProfanity(content);
        const sanitizedContent = fullSanitize(filteredContent);

        // Final length check post-filtering and sanitization
        if (sanitizedContent.length > 500) {
            return NextResponse.json({ error: 'El contenido es demasiado largo después del procesado de seguridad.' }, { status: 400 });
        }

        // 5. Save the comment
        const commentId = adminDb.collection('experience_comments').doc().id;
        await adminDb.collection('experience_comments').doc(commentId).set({
            id: commentId,
            content: sanitizedContent,
            rating,
            category,
            productId: productId || null,
            imageUrl: imageUrl || null,
            ip,
            authorName,
            approved: false, // Double moderation: Admin must approve individual comments too
            createdAt: new Date().toISOString(),
            rewarded: false, // Control de incentivos (cupones)
        });

        // 6. Log rate limit
        await adminDb.collection('experience_comment_logs').add({
            ip,
            createdAt: new Date().toISOString(),
        });

        logger.info(`Nuevo comentario enviado para revisión de IP: ${ip}`);

        return NextResponse.json({
            message: 'Comentario enviado con éxito. Aparecerá una vez que el administrador lo apruebe.'
        }, { status: 201 });

    } catch (error) {
        logger.error('Error al procesar comentario de experiencia', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

export async function GET() {
    try {
        // Fetch only approved comments
        const commentsSnapshot = await adminDb
            .collection('experience_comments')
            .where('approved', '==', true)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        const comments = commentsSnapshot.docs.map(doc => doc.data());

        return NextResponse.json(comments, { status: 200 });
    } catch (error) {
        logger.error('Error al obtener comentarios de experiencias', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
