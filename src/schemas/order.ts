import { z } from "zod";

export const OrderStatusEnum = z.enum(["pending", "completed", "cancelled"]);
export type OrderStatus = z.infer<typeof OrderStatusEnum>;

export const OrderItemSchema = z.object({
    id: z.string(),
    name: z.string(),
    selectedWeight: z.number(),
    finalPrice: z.number(),
    pricePerKg: z.number()
});

export const OrderSchema = z.object({
    customerName: z.string(),
    customerAddress: z.string(),
    paymentMethod: z.enum(["efectivo", "transferencia"]),
    items: z.array(OrderItemSchema),
    total: z.number(),
    status: OrderStatusEnum.default("pending"),
    whatsAppNumber: z.string().optional(),
    createdAt: z.string().optional(), // ISO String
});

export type Order = z.infer<typeof OrderSchema> & { id?: string };
