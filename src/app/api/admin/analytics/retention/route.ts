import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth-server';
import { calculateRetentionAnalytics, calculateCustomerLTV } from '@/lib/analytics-engine';
import { logger } from '@/lib/logger';

/**
 * API: /api/admin/analytics/retention
 * Proporciona datos de cohortes y LTV para el dashboard administrativo.
 * Seguridad: Requiere verificación de privilegios 'admin: true'.
 * Protocolo: MANDATO-FILTRO.
 */
export async function GET(req: NextRequest) {
    try {
        const isAuthorized = await verifyAdmin(req);
        if (!isAuthorized) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
        }

        const [retention, ltv] = await Promise.all([
            calculateRetentionAnalytics(),
            calculateCustomerLTV()
        ]);

        // ✅ SECURITY: Ocultar IPs completas en el dashboard si no es necesario (privacidad)
        // Convertir el Map de LTV en un array anónimo o procesado para el frontend
        const ltvArray = Object.entries(ltv).map(([id, data]) => ({
            id: id.includes('@') ? id : 'Usuario Anónimo',
            ...data
        }));

        return NextResponse.json({
            retention,
            ltv: ltvArray.sort((a, b) => b.ltv - a.ltv).slice(0, 20) // Top 20 clientes LTV
        }, { status: 200 });

    } catch (error) {
        logger.error('Error al obtener analítica de retención', error);
        return NextResponse.json({ error: 'Error interno al procesar analítica' }, { status: 500 });
    }
}
