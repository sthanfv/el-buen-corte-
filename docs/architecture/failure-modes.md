# Failure Modes & Resilience Strategies (SISTEMA ADULTO)

Este documento detalla los escenarios de falla crítica y los protocolos de respuesta manual y automática para garantizar la continuidad del negocio de "El Buen Corte".

## Escenarios de Falla

### 1. Degradación/Caída de Firestore
- **Servicio afectado:** Base de Datos (Firestore)
- **Impacto:** No se pueden consultar productos ni crear pedidos. El panel de admin deja de funcionar.
- **Comportamiento esperado:** La aplicación mostrará un error genérico o quedará en loading infinito.
- **Acción manual:**
  1. Activar el banner de "Mantenimiento" en Vercel.
  2. Redirigir el tráfico a WhatsApp con un mensaje pre-configurado de "Sistema en mantenimiento, toma de pedidos manual".
  3. Consultar inventario manual en el último reporte de "Daily Ticket".

### 2. Fallo de Redis (Upstash)
- **Servicio afectado:** Middleware / Rate Limiting
- **Impacto:** Vulnerabilidad a ataques de fuerza bruta.
- **Comportamiento esperado:** **FAIL-OPEN**. El sistema detectará el error de conexión y permitirá el paso de las solicitudes para no bloquear las ventas legítimas.
- **Acción manual:** Ninguna inmediata. Monitorear logs de seguridad para detectar picos de tráfico inusuales.

### 3. Error en Pasarela de Pago / Notificación WhatsApp
- **Servicio afectado:** WhatsApp (Meta API / Manual)
- **Impacto:** Clientes no reciben confirmación de pedido.
- **Comportamiento esperado:** El pedido queda en estado `CREATED` en el Admin.
- **Acción manual:** El operador debe revisar el panel de admin cada 30 minutos y enviar el mensaje de confirmación manualmente si el bot falla.

### 4. Agotamiento de Stock Simultáneo
- **Servicio afectado:** API de Pedidos
- **Impacto:** Dos clientes intentan comprar el último corte al mismo tiempo.
- **Comportamiento esperado:** La **Transacción Atómica (ACID)** bloqueará el segundo pedido con un error de "Producto Agotado".
- **Acción manual:** Si ocurre un error, el sistema sugerirá productos similares. El carnicero puede ajustar stock manualmente en el Admin si encuentra piezas adicionales.

### 5. Fallo de Resend (Email)
- **Servicio afectado:** Emails Transaccionales
- **Impacto:** Los administradores no reciben la copia del pedido por correo.
- **Comportamiento esperado:** La creación del pedido continúa (desacoplada).
- **Acción manual:** Consultar el panel de Admin para ver nuevas órdenes. El email es solo un respaldo redundante.

---

## Matriz de Severidad

| Escenario | Severidad | RPO (Pérdida de Datos) | RTO (Tiempo de Recuperación) |
| :--- | :--- | :--- | :--- |
| Firestore Down | Crítica | 0 (ACID) | 1 hora |
| Redis Down | Baja | N/A | Automático (Fail-Open) |
| Bot Down | Media | N/A | 30 min (Manual) |
