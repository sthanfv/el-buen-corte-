import crypto from 'crypto';

// ✅ SECURITY: WhatsApp number is NEVER exposed in code
// The actual number is stored encrypted in environment variable

/**
 * Encrypts the seller's WhatsApp number using AES-256-GCM
 * ⚠️ This function MUST ONLY run on the server
 */
export function encryptWhatsApp(phoneNumber: string): string {
    if (typeof window !== 'undefined') {
        throw new Error('SECURITY: encryptWhatsApp can only run on server');
    }

    const key = process.env.WHATSAPP_ENCRYPTION_KEY;
    if (!key || key.length !== 64) {
        throw new Error('WHATSAPP_ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
    }

    const keyBuffer = Buffer.from(key, 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);

    let encrypted = cipher.update(phoneNumber, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Format: iv:encrypted:authTag
    return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
}

/**
 * Decrypts the seller's WhatsApp number
 * ⚠️ This function MUST ONLY run on the server
 */
export function decryptWhatsApp(encryptedData: string): string {
    if (typeof window !== 'undefined') {
        throw new Error('SECURITY: decryptWhatsApp can only run on server');
    }

    const key = process.env.WHATSAPP_ENCRYPTION_KEY;
    if (!key) {
        throw new Error('WHATSAPP_ENCRYPTION_KEY not configured');
    }

    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
    }

    const [ivHex, encryptedHex, authTagHex] = parts;
    const keyBuffer = Buffer.from(key, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

/**
 * Gets the encrypted WhatsApp number from environment
 * ⚠️ Server-side only
 */
export function getEncryptedSellerWhatsApp(): string {
    if (typeof window !== 'undefined') {
        throw new Error('SECURITY: Cannot access WhatsApp on client');
    }

    const encrypted = process.env.WHATSAPP_SELLER_ENCRYPTED;
    if (!encrypted) {
        throw new Error('WHATSAPP_SELLER_ENCRYPTED not configured');
    }

    return encrypted;
}

/**
 * Gets the decrypted WhatsApp number (only for server API use)
 */
export function getSellerWhatsApp(): string {
    const encrypted = getEncryptedSellerWhatsApp();
    return decryptWhatsApp(encrypted);
}

/**
 * Formats WhatsApp URL for order
 */
export function generateWhatsAppOrderURL(
    phoneNumber: string,
    customerName: string,
    items: Array<{ name: string; weight: number; price: number; weightLabel?: string; isFixedPrice?: boolean }>,
    total: number
): string {
    // Format message
    let message = `*🥩 NUEVO PEDIDO - El Buen Corte*\n\n`;
    message += `👤 Cliente: ${customerName}\n\n`;
    message += `📦 *Productos:*\n`;

    items.forEach((item, index) => {
        message += `${index + 1}. ${item.name}\n`;
        const weightValue = item.isFixedPrice && item.weightLabel ? item.weightLabel : `${item.weight}kg`;
        message += `   • Detalle: ${weightValue}\n`;
        message += `   • Precio: $${item.price.toLocaleString('es-CO')}\n\n`;
    });

    message += `💰 *Total: $${total.toLocaleString('es-CO')}*\n\n`;
    message += `✅ Por favor confirme este pedido.\n`;
    message += `📍 Los datos de entrega se enviarán en el siguiente mensaje.`;

    // Clean phone number
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');

    // Generate WhatsApp URL
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}
