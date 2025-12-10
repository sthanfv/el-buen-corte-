import { z } from 'zod';

export const ProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  pricePerKg: z.number().positive('El precio debe ser positivo'),
  category: z.string().min(1, 'La categoría es requerida'),
  stock: z.number().int().nonnegative('El stock no puede ser negativo'),
  images: z.array(
    z.object({
      src: z.string().url('URL de imagen inválida'),
      alt: z.string(),
      aiHint: z.string().optional(),
    })
  ),
  badge: z.string().optional(),
  details: z
    .object({
      corte: z.string(),
      maduracion: z.string(),
      origen: z.string().optional(),
      grasificacion: z.string().optional(),
    })
    .optional(),
  pairing: z.string().optional(),
  reviews: z.number().int().nonnegative().default(0),
  rating: z.number().min(0).max(5).default(5),
});

export type ProductInput = z.infer<typeof ProductSchema>;
