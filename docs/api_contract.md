# 📄 API Contract: Orders V2 (MANDATO-FILTRO)

Esta especificación define los contratos de interfaz para la gestión de pedidos bajo el modelo de Ingeniería Superior.

## 1. Create Order
**Endpoint**: `POST /api/orders/create`  
**Acceso**: Público (Requiere Firebase Token para Rate Limiting/Auditoría)

### Payload (Zod Schema)
```typescript
{
  customerInfo: {
    customerName: string,
    customerPhone: string,
    customerAddress: string,
    customerEmail: string
  },
  items: Array<{
    id: string,
    name: string,
    pricePerKg: number,
    selectedWeight: number,
    finalPrice: number
  }>,
  total: number,
  paymentMethod: 'efectivo' | 'transferencia',
  idempotencyKey?: string
}
```

## 2. Update Order (FSM Enforcement)
**Endpoint**: `POST /api/orders/update`  
**Acceso**: Admin Privilegiado

### Estados Válidos
`CREATED` → `PENDING_VERIFICATION` → `CONFIRMED` → `CUTTING` → `PACKING` → `ROUTING` → `DELIVERED`

### Reglas de Negocio
- No se puede retroceder de estado.
- `CONFIRMED` requiere `transactionId`.
- Cada cambio genera un `history` item con `durationMs`.

---

## 3. Public Order Tracking
**Endpoint**: `GET /api/orders/track?id={orderId}`  
**Acceso**: Público (Solo lectura)

### Response
```json
{
  "id": "ORD-123",
  "status": "CUTTING",
  "estimatedDelivery": "2025-12-19T..."
}
```
