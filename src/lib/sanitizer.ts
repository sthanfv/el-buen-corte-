/**
 * MANDATO-FILTRO: Sistema de Sanitización de Seguridad
 * 
 * Proporciona una sanitización robusta contra ataques XSS (Cross-Site Scripting)
 * sin depender de JSDOM/isomorphic-dompurify, resolviendo incompatibilidades
 * con Next.js / Turbopack.
 */

/**
 * Escapa caracteres HTML peligrosos para prevenir la inyección de scripts.
 * Ideal para campos de texto plano (comentarios, nombres, etc.)
 */
export function sanitizeText(text: string): string {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Limpia una cadena de texto de etiquetas HTML preservando el contenido.
 * Útil para asegurar que no se cuele marcado malicioso.
 */
export function stripHtml(text: string): string {
    if (!text) return '';
    return text.replace(/<[^>]*>?/gm, '');
}

/**
 * Sanitización avanzada para contenido que pudiera contener entidades.
 * Aplica una doble capa de seguridad: limpieza de etiquetas y escape.
 */
export function fullSanitize(text: string): string {
    if (!text) return '';
    const clean = stripHtml(text);
    return sanitizeText(clean);
}
