import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// 🛡️ PRODUCTION-GRADE SECURITY: Distributed Rate Limiting with Upstash Redis
// The keys are provided in the .env file.
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(100, '60 s'),
    analytics: true,
});

export async function middleware(request: NextRequest) {
    // Robust IP detection for Next.js middleware
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        '127.0.0.1';

    // ✅ BLACKLIST CHECK (DEFENSA PROACTIVA - MANDATO-FILTRO)
    const isBlacklisted = await redis.get(`blacklist_${ip}`);
    if (isBlacklisted) {
        return NextResponse.redirect('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    }

    // Rate Limiting Check
    const { success, limit, remaining, reset } = await ratelimit.limit(`ratelimit_${ip}`);

    if (!success) {
        return new NextResponse('Too Many Requests', {
            status: 429,
            headers: {
                'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
                'X-RateLimit-Limit': limit.toString(),
                'X-RateLimit-Remaining': remaining.toString(),
            }
        });
    }

    const response = NextResponse.next();

    // 🛡️ CONSOLIDATED SECURITY HEADERS (OWASP RECOMMENDATIONS)
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
    headers.set(
        'Content-Security-Policy',
        "default-src 'self'; img-src 'self' https: data: blob:; script-src 'self' 'unsafe-inline' https://apis.google.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.firebaseio.com https://*.vercel-storage.com;"
    );

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
