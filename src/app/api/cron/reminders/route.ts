import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { differenceInDays, parseISO } from 'date-fns';

/**
 * CRON API: /api/cron/reminders
 * Ejecución periódica para detectar clientes que necesitan reposición.
 * Lógica: Si han pasado X días (ciclo promedio) desde su última compra, enviar recordatorio.
 * Protocolo: MANDATO-FILTRO.
 */
export async function GET(req: NextRequest) {
    // SECURITY: En producción, proteger con un Header de Secreto de Cron
    const authHeader = req.headers.get('x-cron-secret');
    if (process.env.NODE_ENV === 'production' && authHeader !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const now = new Date();
        const ordersSnapshot = await adminDb.collection('orders')
            .where('status', '==', 'delivered')
            .where('reminded', '==', false)
            .get();

        const remindersSent: string[] = [];

        for (const doc of ordersSnapshot.docs) {
            const order = doc.data();
            const lastOrderDate = parseISO(order.createdAt);
            const daysSince = differenceInDays(now, lastOrderDate);

            // Ciclo de consumo estimado: 15 días por defecto o basado en historial
            const cycle = order.estimatedCycleDays || 15;

            if (daysSince >= cycle) {
                const customerPhone = order.customerInfo?.customerPhone;
                if (customerPhone) {
                    // ✅ PROACTIVIDAD: Aquí se dispararía la API de WhatsApp/Email
                    // Por ahora, registramos la intención y marcamos como "recordado"
                    logger.info(`Disparando recordatorio proactivo para pedido ${doc.id} (Días: ${daysSince})`);

                    await doc.ref.update({
                        reminded: true,
                        remindedAt: now.toISOString()
                    });

                    remindersSent.push(doc.id);
                }
            }
        }

        return NextResponse.json({
            success: true,
            remindersProcessed: remindersSent.length,
            ids: remindersSent
        }, { status: 200 });

    } catch (error) {
        logger.error('Error en el motor de recordatorios proactivos', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
