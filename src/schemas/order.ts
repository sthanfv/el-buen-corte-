import { z } from 'zod';

export const OrderStatusEnum = z.enum([
  'CREATED',                // Recién llegado
  'PENDING_VERIFICATION',   // Esperando que admin valide pago
  'CONFIRMED',              // Pago validado financieramente
  'CUTTING',                // En carnicería (Corte en proceso)
  'PACKING',                // En empaque (Sellado al vacío)
  'ROUTING',                // En ruta (Domiciliario asignado)
  'DELIVERED',              // Entregado con éxito
  'CANCELLED'               // Cancelado por cliente o fraude
]);
export type OrderStatus = z.infer<typeof OrderStatusEnum>;

// ✅ SECURITY: Strict validation for order items
export const OrderItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(200),
  selectedWeight: z.number().positive().max(50), // Max 50kg per item
  finalPrice: z.number().positive().max(10000000), // Max reasonable price
  pricePerKg: z.number().positive(),
  category: z.string().optional(),
  imageUrl: z.string().optional(),
  weightLabel: z.string().optional(),
  isFixedPrice: z.boolean().optional().default(false),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;

// ✅ SECURITY: Customer info validation
export const CustomerInfoSchema = z.object({
  customerName: z
    .string()
    .min(3, 'Nombre debe tener al menos 3 caracteres')
    .max(100, 'Nombre demasiado largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo letras y espacios'),

  customerPhone: z
    .string()
    .min(10, 'Teléfono inválido')
    .max(15, 'Teléfono demasiado largo')
    .regex(/^[0-9+\s()-]+$/, 'Formato de teléfono inválido'),

  customerAddress: z
    .string()
    .min(10, 'Dirección muy corta')
    .max(200, 'Dirección demasiado larga')
    .regex(/^[a-zA-Z0-9\s#.,\-\u00C0-\u017F]+$/, 'Dirección contiene caracteres no permitidos'),

  customerEmail: z.string().email('Email inválido').optional(), // Para retención/LTV
  neighborhood: z.string().max(100).regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s0-9]+$/, 'Barrio inválido').optional(),
  city: z.string().min(2).max(100).regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Ciudad inválida'),
  notes: z.string().max(500).regex(/^[a-zA-Z0-9\s.,!¡?¿\u00C0-\u017F]*$/, 'Notas contienen caracteres no permitidos').optional(),
  deliveryDate: z.string().optional(),
  deliveryTime: z.string().optional(),
});

export type CustomerInfo = z.infer<typeof CustomerInfoSchema>;

// ✅ SECURITY: Complete order with all validations
export const OrderSchema = z.object({
  customerInfo: CustomerInfoSchema,
  items: z.array(OrderItemSchema).min(1, 'Debe haber al menos 1 producto'),
  total: z.number().positive(),
  paymentMethod: z.enum(['efectivo', 'transferencia']),
  status: OrderStatusEnum.default('CREATED'),
  createdAt: z.string().optional(),

  // ✅ CONCILIACIÓN FINANCIERA (MANDATO-FILTRO)
  transactionId: z.string().min(5, 'Código de transacción requerido').optional(),
  verifiedAt: z.string().optional(),
  verifiedBy: z.string().optional(),

  // ✅ AUDITORÍA DE FSM & OBSERVABILIDAD
  history: z.array(z.object({
    status: OrderStatusEnum,
    timestamp: z.string(),
    userId: z.string().optional(),
    durationMs: z.number().optional(), // Para métricas de eficiencia
  })).default([]),

  // ✅ RETENCIÓN: Control de automatización
  reminded: z.boolean().default(false),
  estimatedCycleDays: z.number().optional(),

  // ⚠️ SECURITY: These fields MUST ONLY be set server-side
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export type Order = z.infer<typeof OrderSchema> & { id?: string };

// ✅ Ticket Schema for daily reports
export const TicketSchema = z.object({
  ticketId: z.string(),
  orderNumber: z.number().positive(),
  customerName: z.string(),
  customerPhone: z.string(),
  address: z.string(),
  city: z.string(),
  items: z.array(OrderItemSchema),
  totalAmount: z.number().positive(),
  status: OrderStatusEnum,
  createdAt: z.string(), // ISO timestamp
  deliveryDate: z.string().optional(),
  notes: z.string().optional(),
  // ✅ SECURITY: Audit trail
  ipAddress: z.string().optional(),
  deviceType: z.string().optional(),
});

export type Ticket = z.infer<typeof TicketSchema>;

// ✅ SECURITY: Rate limiting check schema
export const RateLimitCheckSchema = z.object({
  ipAddress: z.string(),
  endpoint: z.string(),
  timestamp: z.number(),
});

export type RateLimitCheck = z.infer<typeof RateLimitCheckSchema>;

