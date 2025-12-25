import { Order } from '@/schemas/order';

/**
 * Lógica de cancelación perezosa (Lazy Cancellation).
 * Se ejecuta en el cliente (Admin Dashboard) al cargar los pedidos.
 *
 * @param orders Lista de pedidos cargados
 * @param updateOrder Función para actualizar el estado del pedido en DB
 * @param restoreStock Función para restaurar el stock del producto
 */
export function autoCancelExpiredOrders(
  orders: Order[],
  updateOrder: (orderId: string, data: Partial<Order>) => void,
  restoreStock: (order: Order) => void
) {
  const now = Date.now();

  orders.forEach((order) => {
    // Si está esperando pago, tiene fecha de expiración y ya pasó la hora -> CANCELAR
    if (
      order.status === 'WAITING_PAYMENT' &&
      order.expiresAt &&
      now > order.expiresAt &&
      order.id
    ) {
      // Logger audit logic here if needed
      // logger.info(`[AutoCancel] Cancelling expired order ${order.id}`);

      // 1. Marcar como cancelado por timeout
      updateOrder(order.id, {
        status: 'CANCELLED_TIMEOUT',
      });

      // 2. Restaurar el inventario reservado
      restoreStock(order);
    }
  });
}
