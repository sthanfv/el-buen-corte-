'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import AdminGuard from '@/components/AdminGuard';
import Link from 'next/link';
import { auth } from '@/firebase/client';

const productSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  category: z.string().min(2, 'La categoría es requerida.'),
  pricePerKg: z.coerce
    .number()
    .positive('El precio debe ser un número positivo.'),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo.'),
  image: z
    .any()
    .refine((files) => files?.length === 1, 'La imagen es requerida.'),
  origen: z.string().optional(),
  maduracion: z.string().optional(),
  grasa: z.string().optional(),
  pairing: z.string().optional(),
  badge: z.string().optional(),
  corte: z.string().optional(),
  // ✅ MITIGACIÓN OPERATIVA
  weightLabel: z.string().optional(),
  minWeight: z.coerce.number().optional(),
  isFixedPrice: z.boolean().default(false),
  basePrice: z.coerce.number().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function NewProductPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      category: 'Res',
      pricePerKg: 0,
      stock: 0,
      origen: '',
      maduracion: '',
      grasa: '',
      pairing: '',
      badge: '',
      corte: '',
      weightLabel: '',
      minWeight: 0,
      isFixedPrice: false,
      basePrice: 0,
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    setIsLoading(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error('No estás autenticado.');

      const file = data.image[0] as File;
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/upload/blob', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        body: formData,
      });

      if (!uploadRes.ok) {
        if (uploadRes.status === 401)
          throw new Error('Sesión expirada. Recarga la página.');
        throw new Error('Fallo en la subida de la imagen.');
      }
      const { url } = await uploadRes.json();

      const productData = {
        name: data.name,
        category: data.category,
        pricePerKg: data.pricePerKg,
        stock: data.stock,
        rating: 0,
        reviews: 0,
        images: [
          {
            src: url,
            alt: `Imagen de ${data.name}`,
            aiHint: 'product image',
          },
        ],
        details: {
          origen: data.origen || '',
          maduracion: data.maduracion || '',
          grasa: data.grasa || '',
          corte: data.corte || '',
        },
        pairing: data.pairing || '',
        badge: data.badge || '',
        weightLabel: data.weightLabel || '',
        minWeight: data.minWeight || 0,
        isFixedPrice: data.isFixedPrice || false,
        basePrice: data.basePrice || 0,
      };

      const createRes = await fetch('/api/products/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(productData),
      });

      if (!createRes.ok) {
        const errorData = await createRes.json();
        throw new Error(errorData.error || 'No se pudo crear el producto.');
      }

      toast({
        type: 'success',
        title: 'Producto Creado',
        message: `${data.name} ha sido añadido al catálogo.`,
      });
      form.reset();
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        type: 'error',
        title: 'Error al Crear',
        message:
          error instanceof Error
            ? error.message
            : 'No se pudo crear el producto.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminGuard>
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black">Crear Nuevo Producto</h1>
          <Link href="/admin/products" passHref>
            <Button variant="outline">Volver a Productos</Button>
          </Link>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Producto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Tomahawk King" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Res" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="pricePerKg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio por Kg</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ej: 125000"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Disponible</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ej: 5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="image"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel>Imagen Principal</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={(e) => {
                        onChange(e.target.files);
                      }}
                      {...rest}
                    />
                  </FormControl>
                  <FormDescription>
                    Sube la imagen principal del producto.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <h2 className="text-xl font-bold border-b pb-2 mt-10">
              Detalles Adicionales
            </h2>

            <FormField
              control={form.control}
              name="corte"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción del Corte</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Corte grueso con hueso de la costilla..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FormField
                control={form.control}
                name="origen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origen</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Angus (USA)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maduracion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maduración</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 30 días" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="grasa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nivel de Grasa</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Marmoleo A5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="pairing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maridaje</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Malbec Reserva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="badge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Badge</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Premium" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <h2 className="text-xl font-bold border-b pb-2 mt-10 text-primary">
              ⚖️ Control de Peso Variable (Mitigación)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-muted/30 p-4 rounded-lg">
              <FormField
                control={form.control}
                name="weightLabel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rango de Peso (Etiqueta)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Aprox. 900g - 1.1kg" {...field} />
                    </FormControl>
                    <FormDescription>Lo que el cliente verá en la web.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso Mínimo Garantizado (Kg)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="Ej: 0.9" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 border rounded-lg bg-primary/5">
              <FormField
                control={form.control}
                name="isFixedPrice"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Input
                        type="checkbox"
                        className="w-4 h-4 mt-1"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Vender por Pieza Fija</FormLabel>
                      <FormDescription>
                        Si se activa, se ignora el gramaje exacto para el cobro.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio por Pieza (Estandarizado)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ej: 50000" {...field} disabled={!form.watch('isFixedPrice')} />
                    </FormControl>
                    <FormDescription>Precio final que paga el cliente.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Producto
            </Button>
          </form>
        </Form>
      </div>
    </AdminGuard>
  );
}
