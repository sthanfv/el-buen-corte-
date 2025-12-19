import { ImageResponse } from 'next/og';

export const runtime = 'edge';

/**
 * OG Image Generator (MANDATO-FILTRO: Nivel Google)
 * Genera tarjetas visuales dinámicas para marketing en WhatsApp/Social Media.
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const title = searchParams.get('title') || 'EL BUEN CORTE';
        const price = searchParams.get('price') || '';
        const badge = searchParams.get('badge') || 'PREMIUM';

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#09090b', // Zinc-950
                        backgroundImage: 'radial-gradient(circle at 50% 50%, #18181b 0%, #09090b 100%)',
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            top: 50,
                            left: 50,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 15,
                        }}
                    >
                        <div style={{ backgroundColor: '#ef4444', padding: '10px 25px', borderRadius: 4, transform: 'skewX(-15deg)' }}>
                            <span style={{ color: 'white', fontSize: 32, fontWeight: 900, letterSpacing: -2 }}>BUENCORTE</span>
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0 80px',
                            textAlign: 'center',
                        }}
                    >
                        <div style={{ fontSize: 24, fontWeight: 900, color: '#ef4444', letterSpacing: 8, marginBottom: 20, opacity: 0.8 }}>
                            {badge.toUpperCase()}
                        </div>
                        <div style={{ fontSize: 80, fontWeight: 900, color: 'white', letterSpacing: -4, lineHeight: 1.1, textTransform: 'uppercase', fontStyle: 'italic' }}>
                            {title}
                        </div>

                        {price && (
                            <div style={{
                                marginTop: 40,
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                border: '2px solid #ef4444',
                                padding: '15px 40px',
                                borderRadius: 50
                            }}>
                                <span style={{ fontSize: 48, fontWeight: 900, color: '#ef4444' }}>
                                    Solo: {price}
                                </span>
                            </div>
                        )}
                    </div>

                    <div style={{ position: 'absolute', bottom: 50, right: 80, color: 'rgba(255,255,255,0.4)', fontSize: 20, fontWeight: 700 }}>
                        DOMICILIOS PREMIUM • 24 HORAS
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (e: any) {
        return new Response(`Fallo en la generación OG`, { status: 500 });
    }
}
