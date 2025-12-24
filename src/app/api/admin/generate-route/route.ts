import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase';
import { headers } from 'next/headers';
import { logger } from '@/lib/logger';

/**
 * MANDATO-FILTRO: Generador de Rutas para Mensajero
 *
 * Genera un texto formateado listo para copiar y pegar en WhatsApp
 * con todos los pedidos en estado PACKING, optimizando la logística
 * de última milla.
 */

interface DeliveryStop {
  orderNumber: string;
  customerName: string;
  address: string;
  neighborhood?: string;
  city: string;
  phone: string;
  amountToCollect: number;
  notes?: string;
  paymentMethod: string;
}

export async function POST(req: Request) {
  try {
    // ✅ SECURITY: Verificar autenticación admin
    const headersList = await headers();
    const authorization = headersList.get('Authorization');

    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authorization.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    if (decodedToken.admin !== true) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Obtener parámetros opcionales
    const body = await req.json();
    const { deliveryWindow, orderIds } = body;

    // Construir query
    let query = adminDb.collection('orders').where('status', '==', 'PACKING');

    // Si se especifican IDs específicos, filtrar por ellos
    if (orderIds && Array.isArray(orderIds) && orderIds.length > 0) {
      // Firestore limita 'in' a 10 elementos
      if (orderIds.length > 10) {
        return NextResponse.json(
          { error: 'Máximo 10 pedidos por ruta' },
          { status: 400 }
        );
      }
      query = adminDb.collection('orders').where('__name__', 'in', orderIds);
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      return NextResponse.json({
        message: 'No hay pedidos listos para despacho',
        routeText: '',
        stops: [],
      });
    }

    // Procesar pedidos
    const stops: DeliveryStop[] = [];
    let totalToCollect = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      const orderRef = doc.id.slice(-4).toUpperCase(); // Últimos 4 caracteres del ID

      const amountToCollect =
        data.paymentMethod === 'efectivo' && data.status !== 'PAID_VERIFIED'
          ? data.total
          : 0;

      totalToCollect += amountToCollect;

      stops.push({
        orderNumber: `#ORD-${orderRef}`,
        customerName: data.customerInfo?.customerName || 'Sin nombre',
        address: data.customerInfo?.customerAddress || 'Sin dirección',
        neighborhood: data.customerInfo?.neighborhood,
        city: data.customerInfo?.city || 'Bogotá',
        phone: data.customerInfo?.customerPhone || 'Sin teléfono',
        amountToCollect,
        notes: data.customerInfo?.notes,
        paymentMethod: data.paymentMethod,
      });
    });

    // Generar texto formateado para WhatsApp
    const routeText = generateWhatsAppRoute(
      stops,
      totalToCollect,
      deliveryWindow
    );

    logger.info('Ruta generada exitosamente', {
      adminUid: decodedToken.uid,
      stopsCount: stops.length,
      totalToCollect,
    });

    return NextResponse.json({
      success: true,
      routeText,
      stops,
      totalStops: stops.length,
      totalToCollect,
    });
  } catch (e: any) {
    logger.error('Error generando ruta de entrega', e);
    return NextResponse.json(
      { error: 'Error al generar la ruta' },
      { status: 500 }
    );
  }
}

/**
 * Genera el texto formateado para WhatsApp
 */
function generateWhatsAppRoute(
  stops: DeliveryStop[],
  totalToCollect: number,
  deliveryWindow?: string
): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
  });

  const windowLabel = deliveryWindow || 'GENERAL';

  let text = `📅 RUTA ${windowLabel.toUpperCase()} - ${dateStr}\n`;
  text += `${'='.repeat(35)}\n\n`;

  stops.forEach((stop, index) => {
    text += `📦 PARADA ${index + 1}: ${stop.customerName}\n`;
    text += `📍 Dirección: ${stop.address}\n`;

    if (stop.neighborhood) {
      text += `🏘️ Barrio: ${stop.neighborhood}\n`;
    }

    text += `🏙️ Ciudad: ${stop.city}\n`;
    text += `📞 Tel: ${stop.phone}\n`;

    if (stop.amountToCollect > 0) {
      text += `💰 COBRAR: $${stop.amountToCollect.toLocaleString('es-CO')}\n`;
    } else {
      text += `✅ PAGO: Ya confirmado\n`;
    }

    if (stop.notes) {
      text += `📝 Notas: ${stop.notes}\n`;
    }

    text += `\n${'—'.repeat(35)}\n\n`;
  });

  text += `📊 RESUMEN DE RUTA\n`;
  text += `Total paradas: ${stops.length}\n`;
  text += `Total a cobrar: $${totalToCollect.toLocaleString('es-CO')}\n`;
  text += `\n✅ ¡Buena ruta! 🚴‍♂️\n`;

  return text;
}
