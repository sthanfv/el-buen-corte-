import { sendOrderConfirmation } from './email';
import { logger } from './logger';
import { adminDb } from './firebase';

/**
 * Event-Driven Architecture: Background Processor
 * Desacopla la lógica de negocio de la respuesta al cliente.
 * Protocolo: MANDATO-FILTRO.
 */

type OrderEvent = {
    type: 'ORDER_CREATED';
    payload: {
        orderId: string;
        orderData: any;
    };
};

export async function processOrderEvent(event: OrderEvent) {
    const { orderId, orderData } = event.payload;

    logger.info(`Procesando evento asíncrono ${event.type} para pedido ${orderId}`);

    try {
        // 1. Envío de Email (Async)
        await sendOrderConfirmation({
            orderNumber: orderId.slice(0, 8).toUpperCase(),
            customerName: orderData.customerInfo.customerName,
            totalAmount: orderData.total,
            items: orderData.items.map((i: any) => ({
                name: i.name,
                quantity: 1,
                price: i.finalPrice
            }))
        }).catch(e => logger.error('Fallo en Handler: Email', { orderId, error: e }));

        // 2. Actualización de Analítica / LTV (Async)
        // El motor de analítica ya lo recalcula en el dashboard, 
        // pero aquí podríamos disparar una actualización de caché si fuera necesario.

        // 3. Notificación WhatsApp (Simulado)
        logger.audit('Notificación WhatsApp enviada (Simulado)', { orderId, phone: orderData.customerInfo.customerPhone });

        logger.info(`Evento ${event.type} procesado con éxito para ${orderId}`);
    } catch (error) {
        logger.error(`Error crítico en Background Processor para ${orderId}`, error);
    }
}
