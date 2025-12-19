import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { verifyAdmin } from '@/lib/auth-server';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    if (!await verifyAdmin(request)) {
        return NextResponse.json({ error: 'Acceso denegado: Privilegios insuficientes' }, { status: 403 });
    }
    const { id: commentId } = params;

    let action = 'procesar';
    try {
        const body = await request.json();
        action = body.action;

        if (action === 'approve') {
            const docRef = adminDb.collection('experience_comments').doc(commentId);
            const doc = await docRef.get();
            const data = doc.data();

            await docRef.update({
                approved: true,
                updatedAt: new Date().toISOString(),
            });

            // ✅ INCENTIVO: Si tiene foto, generar código de descuento
            if (data?.imageUrl && !data?.rewarded) {
                const couponCode = `GRACIAS-${Math.random().toString(36).toUpperCase().slice(2, 8)}`;
                await adminDb.collection('coupons').add({
                    code: couponCode,
                    discount: 10, // 10% fijo por defecto
                    used: false,
                    targetUser: data.ip,
                    createdAt: new Date().toISOString()
                });
                await docRef.update({ rewarded: true, couponCode });
                logger.info(`Incentivo generado para ${commentId}: ${couponCode}`);
            }

            logger.info(`Comentario ${commentId} aprobado por admin.`);
        } else if (action === 'reject') {
            await adminDb.collection('experience_comments').doc(commentId).delete();
            logger.info(`Comentario ${commentId} rechazado/borrado por admin.`);
        }

        return NextResponse.json({ message: `Acción ${action} realizada con éxito.` });
    } catch (error) {
        logger.error(`Error al ${action} comentario de experiencia`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
