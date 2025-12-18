import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // 🛡️ SECURITY HEADERS (OWASP RECOMMENDATIONS)
    const headers = response.headers;

    // HSTS: Forzar HTTPS siempre (1 año)
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

    // Anti-Clickjacking: Solo permitir iframes de mismo origen
    headers.set('X-Frame-Options', 'SAMEORIGIN');

    // Anti-MIME Sniffing
    headers.set('X-Content-Type-Options', 'nosniff');

    // Referrer Policy: Privacidad al navegar fuera
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions Policy: Deshabilitar APIs peligrosas/no usadas
    headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');

    // CSP: Content Security Policy (Endurecida)
    // Se elimina 'unsafe-eval' para cumplir con estándares modernos de seguridad.
    // 'unsafe-inline' se mantiene temporalmente para compatibilidad con estilos dinámicos de Shadcn/UI y Next.js.
    headers.set(
        'Content-Security-Policy',
        "default-src 'self'; img-src 'self' https: data: blob:; script-src 'self' 'unsafe-inline' https://apis.google.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.firebaseio.com https://*.vercel-storage.com;"
    );

    return response;
}

export const config = {
    matcher: [
        // Aplicar a todas las rutas excepto estáticas y API (la API tiene su propio manejo si se desea)
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
