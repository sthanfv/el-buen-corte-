# 📋 Guía de Operación Diaria - El Buen Corte 🥩
**Versión**: 2.1
**Estado**: ✅ Operativo

Esta guía es el manual de procedimientos para garantizar que cada cliente reciba su carne premium con la calidad esperada. **Regla de Oro:** "Si no está en el sistema, no existe".

---

## 🌅 1. Inicio de Jornada (10:00 AM)
- [ ] **Dashboard Check**: Abrir el Panel Administrativo para revisar pedidos nocturnos.
- [ ] **Inventario Físico vs Digital**: ¿Coincide el stock de cortes premium? Ajustar en la pestaña `Productos` si es necesario.
- [ ] **Alertas de Expiración**: Revisar si hay pedidos con "⚠️ EXPIRADO" (más de 1h sin pago). Contactar al cliente por WhatsApp antes de cancelar.

## 💰 2. Validación de Pagos (Continuo)
Para cada pedido en **ESPERANDO PAGO**:
1.  **WhatsApp Business**: Revisar el comprobante enviado por el cliente.
2.  ** App Bancaria**: Confirmar que el dinero entró *realmente* a la cuenta.
3.  **Acción**: Cambiar estado a `PAGO VERIFICADO`. 
    *   *Nota: El sistema enviará automáticamente un correo de confirmación.*

## 🔪 3. Área de Corte y Empaque
Solo procesar pedidos en `PAGO VERIFICADO`.
- **Protocolo de Peso Variable**:
    - Si el peso real es **menor** al mínimo: Completar el gramaje o cortar otra pieza.
    - Si el peso real es **mayor** al máximo: **Enviar igual**. El cliente queda feliz y el margen del negocio ya cubre esta cortesía (Fidelización).
- **Etiquetado**: Marcar cada bolsa con el nombre del cliente y el `#ID` del pedido.
- **Cambio de Estado**: Pasar a `EMPACANDO` una vez sellado al vacío.

## 🚚 4. Despacho y Logística (3:00 PM - 5:00 PM)
1.  **Generar Ruta**: En el Panel de Pedidos, filtrar por `EMPACANDO`.
2.  **WhatsApp del Mensajero**: Usar la herramienta "Generar Ruta" para enviar las direcciones, teléfonos y cobros (si aplica) de forma consolidada.
3.  **En Ruta**: Cambiar masivamente los pedidos a `EN RUTA`.

## 📊 5. Cierre y Auditoría (8:00 PM)
- [ ] **Confirmar Entregas**: Cambiar pedidos entregados a `ENTREGADO`.
- [ ] **Resumen del Día**: Clic en `📊 Resumen del Día`.
- [ ] **Cuadre de Caja**:
    - **Efectivo**: El dinero físico debe coincidir con el reporte.
    - **Transferencias**: Sumar Nequi/Bancolombia vs Reporte Digital.
- [ ] **Facturación Global**: Generar factura consolidada para pedidos que no solicitaron factura electrónica individual.

---

## 🚨 Situaciones Especiales
- **Cliente no responde al mensajero**: El mensajero espera 10 min. Si no hay contacto, el pedido se regresa a la carnicería. Cambiar estado a `PAGO VERIFICADO` y reagendar.
- **Stock Agotado Inesperadamente**: Llamar de inmediato al cliente. Ofrecer un corte superior por el mismo precio o devolución del dinero. **La reputación vale más que un filete.**

---
*Manual de Operaciones - El Buen Corte v2.1*
