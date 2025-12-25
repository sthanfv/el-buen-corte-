import { z } from 'zod';

export const AdminAuditLogSchema = z.object({
  id: z.string().optional(),
  actorId: z.string(),
  action: z.enum([
    'ORDER_STATUS_CHANGE',
    'PRODUCT_UPDATE',
    'STOCK_ADJUSTMENT',
    'CONFIG_CHANGE',
    'SECURITY_UPDATE',
  ]),
  targetId: z.string(),
  before: z.any().optional(),
  after: z.any().optional(),
  ip: z.string(),
  userAgent: z.string(),
  createdAt: z.string(),
});

export type AdminAuditLog = z.infer<typeof AdminAuditLogSchema>;
