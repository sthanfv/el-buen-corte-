# 📄 API Contract: Orders V2.5 (High Engineering)
**Versión**: 2.5
**Protocolo**: MANDATO-FILTRO

Esta especificación define los contratos de interfaz para la gestión de pedidos, garantizando la interoperabilidad entre el frontend y los servicios serverless.

---

## 🔒 1. Create Order (POST `/api/orders/create`)
**Acceso**: Público (Validación de Token Firebase requerida).

### Seguridad:
*   **Idempotencia**: Soporta `idempotencyKey` para evitar pedidos duplicados por fallos de red.
*   **Atomicidad**: Ejecuta una transacción ACID en Firestore (Verifica Stock -> Reserva -> Crea Orden).

### Payload (Zod Schema)
```json
{
  "customerInfo": {
    "customerName": "string (min 3)",
    "customerPhone": "string (10-15 digits)",
    "customerAddress": "string",
    "customerEmail": "string (email)",
    "requiresInvoice": "boolean",
    "invoiceNIT": "string (optional)"
  },
  "items": [
    {
      "id": "string",
      "name": "string",
      "selectedWeight": "number",
      "finalPrice": "number",
      "pricePerKg": "number"
    }
  ],
  "total": "number",
  "paymentMethod": "efectivo | transferencia",
  "idempotencyKey": "string (UUID)"
}
```

---

## 🛠️ 2. Update Order (POST `/api/orders/update`)
**Acceso**: Admin Privilegiado.

### Flujo de Estados (FSM)
Los estados deben seguir este orden lógico. No se permite el retroceso.
1. `CREATED`
2. `WAITING_PAYMENT` (Esperando comprobante)
3. `PAID_VERIFIED` (Dinero confirmado en banco)
4. `CUTTING` (Proceso de carnicería)
5. `PACKING` (Empaque al vacío)
6. `ROUTING` (En manos del mensajero)
7. `DELIVERED` (Entregado al cliente)
8. `CANCELLED_TIMEOUT` (Estado terminal por falta de pago)

### Reglas:
- `PAID_VERIFIED`: Actualiza `verifiedAt` y `verifiedBy`.
- `DELIVERED`: Bloquea permanentemente futuras ediciones del pedido.

---

## 🔍 3. Public Order Tracking (GET `/api/orders/status/[id]`)
**Acceso**: Público (Read-Only).

### Response
```json
{
  "id": "string",
  "status": "string",
  "createdAt": "ISOString",
  "itemsCount": "number",
  "isPaid": "boolean"
}
```

---
*API Specification - El Buen Corte v2.5*
