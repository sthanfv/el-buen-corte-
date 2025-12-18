import { Resend } from 'resend';
import { logger } from './logger';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface OrderEmailData {
    orderNumber: string | number;
    customerName: string;
    customerEmail?: string;
    totalAmount: number;
    items: { name: string; quantity: number; price: number }[];
}

export async function sendOrderConfirmation(data: OrderEmailData) {
    if (!process.env.RESEND_API_KEY) {
        // In development, we can log this, but in production we should avoid info leaks
        if (process.env.NODE_ENV === 'development') {
            console.warn('[EMAIL SERVICE] Missing RESEND_API_KEY. Email simulation active.');
        }
        return { success: true, mock: true };
    }

    try {
        const itemList = data.items
            .map(item => `<li>${item.name} x${item.quantity} - $${item.price.toLocaleString('es-CO')}</li>`)
            .join('');

        const html = `
            <h1>¡Gracias por tu compra, ${data.customerName}!</h1>
            <p>Tu pedido #${data.orderNumber} ha sido recibido.</p>
            <h3>Resumen:</h3>
            <ul>${itemList}</ul>
            <p><strong>Total: $${data.totalAmount.toLocaleString('es-CO')}</strong></p>
            <p>Nos pondremos en contacto contigo pronto para coordinar la entrega.</p>
        `;

        const { data: response, error } = await resend.emails.send({
            from: 'El Buen Corte <pedidos@elbuencorte.com>', // Ensure domain is verified in Resend
            to: [data.customerEmail || 'admin@elbuencorte.com'],
            subject: `Confirmación de Pedido #${data.orderNumber}`,
            html: html,
        });

        if (error) {
            // Log error for internal monitoring, don't expose to client
            logger.error('Email service failure', { error, orderNumber: data.orderNumber });
            return { success: false, error: 'Email service failure' };
        }

        logger.info('Order confirmation email sent', { orderNumber: data.orderNumber });
        return { success: true };
    } catch (error) {
        logger.error('Fatal email service error', { error, orderNumber: data.orderNumber });
        return { success: false, error: 'Internal server error' };
    }
}
