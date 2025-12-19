import { z } from 'zod';

export const ExperienceRequestSchema = z.object({
    fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(50),
    email: z.string().email("Email inválido").optional(),
    reason: z.string().min(10, "Cuéntanos un poco más sobre por qué quieres unirte").max(200),
});

export type ExperienceRequest = z.infer<typeof ExperienceRequestSchema> & {
    ip: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
};

export const CommentSchema = z.object({
    content: z.string().min(5, "El comentario es muy corto").max(500),
    rating: z.number().min(1).max(5),
    category: z.enum(['service', 'price', 'delivery', 'other']),
    productId: z.string().optional(), // Vínculo a producto para inyección UGC
    imageUrl: z.string().url("URL de imagen inválida").optional(), // Foto real del cliente
});

export type ExperienceComment = z.infer<typeof CommentSchema> & {
    ip: string;
    authorName: string;
    approved: boolean;
    createdAt: string;
};
