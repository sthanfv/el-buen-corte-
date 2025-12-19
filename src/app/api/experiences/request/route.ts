import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase';
import { ExperienceRequestSchema } from '@/schemas/experience';
import { logger } from '@/lib/logger';
import { hasProfanity } from '@/lib/profanity-filter';
import { fullSanitize } from '@/lib/sanitizer';

export async function POST(request: NextRequest) {
    try {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
            request.headers.get('x-real-ip') ||
            '127.0.0.1';

        // SECURITY CHECK: Banned IP
        const banDoc = await adminDb.collection('banned_ips').doc(ip).get();
        if (banDoc.exists) {
            return NextResponse.json({
                error: 'ACCESO BLOQUEADO. Tu dispositivo ha sido restringido permanentemente.'
            }, { status: 403 });
        }

        const body = await request.json();

        // Validation with Zod
        const validation = ExperienceRequestSchema.safeParse(body);
        if (!validation.success) {
            const errorMsg = Object.values(validation.error.flatten().fieldErrors).flat().join(', ');
            return NextResponse.json({ error: errorMsg || 'Datos inválidos' }, { status: 400 });
        }

        const { fullName, reason, email } = validation.data;

        // SECURITY: Profanity check in reason
        if (hasProfanity(reason) || hasProfanity(fullName)) {
            return NextResponse.json({ error: 'Contenido inapropiado detectado.' }, { status: 400 });
        }

        // Check if there's already a pending or approved request for this IP
        const existingRequest = await adminDb.collection('experience_requests').doc(ip).get();

        if (existingRequest.exists) {
            const data = existingRequest.data();
            if (data?.status === 'approved') {
                return NextResponse.json({ message: 'Tu IP ya está aprobada. ¡Puedes comentar!' }, { status: 200 });
            }
            if (data?.status === 'pending') {
                return NextResponse.json({ error: 'Ya tienes una solicitud pendiente de aprobación.' }, { status: 429 });
            }
        }

        // Create the request
        await adminDb.collection('experience_requests').doc(ip).set({
            fullName: fullSanitize(fullName),
            email: email || '',
            reason: fullSanitize(reason),
            ip,
            status: 'pending',
            createdAt: new Date().toISOString(),
        });

        logger.info(`Nueva solicitud de experiencia recibida de IP: ${ip}`);

        return NextResponse.json({ message: 'Solicitud enviada con éxito. El administrador la revisará pronto.' }, { status: 201 });

    } catch (error) {
        logger.error('Error al procesar solicitud de experiencia', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
