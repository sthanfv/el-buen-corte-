# 📋 Guía de Operación Diaria - El Buen Corte

Esta lista de chequeo debe realizarse **todos los días** para garantizar el éxito de la operación. "Confiar en el sistema, no en la memoria".

## 🌅 Inicio de Jornada (10:00 AM)
- [ ] **Abrir Admin Dashboard**: Verificar si entraron pedidos nocturnos.
- [ ] **Verificar Stock Crítico**: ¿Queda suficiente Tomahawk/Picanha para el día?
- [ ] **Actualizar Precios/Stock**: Si algo cambió, actualizarlo en `Productos`.

## 🥩 Proceso de Pedidos (Continuo)
Para cada pedido nuevo en estado **CREADO/ESPERANDO PAGO**:
1.  [ ] **Verificar Pago**:
    *   Si es Nequi/Bancolombia: Abrir App del banco y confirmar recepción exactaa.
    *   **ACCIÓN EN SISTEMA**: Clic en `Marcar Pago Recibido` (Solo si la plata está en mano).
2.  [ ] **Pasar a Corte**:
    *   Una vez verificado, cambiar estado a `EN CORTE`.
    *   El carnicero recibe la orden (impresa o verbal).
3.  [ ] **Pesaje y Empaque**:
    *   Verificar peso real vs peso solicitado.
    *   Anotar en la bolsa el # de Pedido.

## 🚚 Despacho (3:00 PM - 5:00 PM)
- [ ] **Generar Ruta**:
    *   Ir a Admin -> Generar Ruta.
    *   Filtrar por pedidos en `EMPACANDO`.
    *   **Copiar Ruta**: Enviar texto generado al WhatsApp del mensajero.
- [ ] **Cambiar Estados**:
    *   Pasar todos los pedidos de la ruta a `EN RUTA`.

## 🌙 Cierre de Caja (8:00 PM)
- [ ] **Abrir Resumen del Día**:
    *   Clic en botón `📊 Resumen del Día`.
- [ ] **Contar Efectivo**:
    *   Comparar billetes físicos con `Total Efectivo (Caja)`.
    *   ¿Cuadra? ✅ Guardar. ❌ Investigar diferencia.
- [ ] **Verificar Transferencias**:
    *   Sumar totales de apps bancarias vs `Total Ventas - Total Efectivo`.

---
**💡 Regla de Oro:** Si el pedido no está en el sistema, **NO EXISTE**. Todo movimiento de dinero o carne debe reflejarse aquí.
