'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import Image from 'next/image';
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
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Upload } from 'lucide-react';
import AdminGuard from '@/components/AdminGuard';
import { auth } from '@/firebase/client';
import type { Product } from '@/types/products';

// ✅ SECURITY: Strict validation schema
const editProductSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres.')
    .max(100, 'El nombre es demasiado largo.')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-]+$/, 'Solo letras, espacios y guiones'),
  category: z
    .string()
    .min(2, 'La categoría es requerida.')
    .max(50, 'Categoría demasiado larga'),
  pricePerKg: z.coerce
    .number()
    .positive('El precio debe ser positivo.')
    .max(10000000, 'Precio fuera de rango válido'),
  stock: z.coerce
    .number()
    .int('El stock debe ser un número entero.')
    .min(0, 'El stock no puede ser negativo.')
    .max(1000, 'Stock fuera de rango válido'),
  image: z.any().optional(),
  origen: z.string().max(100, 'Texto demasiado largo').optional(),
  maduracion: z.string().max(100, 'Texto demasiado largo').optional(),
  grasa: z.string().max(100, 'Texto demasiado largo').optional(),
  pairing: z.string().max(100, 'Texto demasiado largo').optional(),
  badge: z.string().max(50, 'Badge demasiado largo').optional(),
  corte: z.string().max(500, 'Descripción demasiado larga').optional(),
});

type EditProductFormValues = z.infer<typeof editProductSchema>;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const form = useForm<EditProductFormValues>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      name: '',
      category: '',
      pricePerKg: 0,
      stock: 0,
      origen: '',
      maduracion: '',
      grasa: '',
      pairing: '',
      badge: '',
      corte: '',
    },
  });

  // ✅ SECURITY: Fetch con validación de ID
  useEffect(() => {
    async function fetchProduct() {
      // Validate productId format (prevent injection)
      if (!productId || typeof productId !== 'string' || productId.length > 50) {
        toast({
          type: 'error',
          title: 'ID Inválido',
          message: 'El ID del producto no es válido.',
        });
        router.push('/admin/products');
        return;
      }

      try {
        const res = await fetch(`/api/products/list`);
        if (!res.ok) throw new Error('Error al cargar productos');

        const products: Product[] = await res.json();
        const product = products.find((p) => p.id === productId);

        if (!product) {
          throw new Error('Producto no encontrado');
        }

        // ✅ SECURITY: Sanitize data before setting form
        form.reset({
          name: String(product.name || '').substring(0, 100),
          category: String(product.category || '').substring(0, 50),
          pricePerKg: Number(product.pricePerKg) || 0,
          stock: Number(product.stock) || 0,
          origen: String(product.details?.origen || '').substring(0, 100),
          maduracion: String(product.details?.maduracion || '').substring(0, 100),
          grasa: String(product.details?.grasa || '').substring(0, 100),
          pairing: String(product.pairing || '').substring(0, 100),
          badge: String(product.badge || '').substring(0, 50),
          corte: String(product.details?.corte || '').substring(0, 500),
        });

        if (product.images && product.images.length > 0) {
          setCurrentImageUrl(product.images[0].src);
        }
      } catch (error) {
        toast({
          type: 'error',
          title: 'Error',
          message: error instanceof Error ? error.message : 'No se pudo cargar el producto.',
        });
        router.push('/admin/products');
      } finally {
        setIsFetching(false);
      }
    }

    fetchProduct();
  }, [productId, form, router, toast]);

  const onSubmit = async (data: EditProductFormValues) => {
    setIsLoading(true);
    setUploadProgress(0);

    try {
      // ✅ SECURITY: Get fresh token
      const idToken = await auth.currentUser?.getIdToken(true);
      if (!idToken) {
        throw new Error('Sesión expirada. Por favor, recarga la página.');
      }

      let imageUrl = currentImageUrl;

      // Upload new image if provided
      if (data.image && data.image.length > 0) {
        const file = data.image[0] as File;

        // ✅ SECURITY: Validate file type and size
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
          throw new Error('Tipo de archivo no permitido. Usa JPG, PNG o WebP.');
        }

        if (file.size > maxSize) {
          throw new Error('La imagen es demasiado grande. Máximo 5MB.');
        }

        setUploadProgress(30);

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
          if (uploadRes.status === 401) {
            throw new Error('Sesión expirada. Recarga la página.');
          }
          throw new Error('Error al subir la imagen.');
        }

        const { url } = await uploadRes.json();
        imageUrl = url;
        setUploadProgress(60);
      }

      // ✅ SECURITY: Prepare sanitized data
      const productData = {
        name: data.name.trim(),
        category: data.category.trim(),
        pricePerKg: data.pricePerKg,
        stock: data.stock,
        images: [
          {
            src: imageUrl,
            alt: `Imagen de ${data.name.trim()}`,
            aiHint: 'product image',
          },
        ],
        details: {
          origen: data.origen?.trim() || '',
          maduracion: data.maduracion?.trim() || '',
          grasa: data.grasa?.trim() || '',
          corte: data.corte?.trim() || '',
        },
        pairing: data.pairing?.trim() || '',
        badge: data.badge?.trim() || '',
      };

      setUploadProgress(80);

      // ✅ SECURITY: Call update API with validation
      const updateRes = await fetch('/api/products/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          id: productId,
          data: productData,
        }),
      });

      if (!updateRes.ok) {
        const errorData = await updateRes.json();
        throw new Error(errorData.error || 'No se pudo actualizar el producto.');
      }

      setUploadProgress(100);

      toast({
        type: 'success',
        title: 'Producto Actualizado',
        message: `${data.name} ha sido actualizado exitosamente.`,
      });

      // Redirect after success
      setTimeout(() => {
        router.push('/admin/products');
      }, 1000);
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'No se pudo actualizar el producto.',
      });
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  if (isFetching) {
    return (
      <AdminGuard>
        <div className=\"flex items-center justify-center min-h-screen\">
          <div className=\"text-center\">
            <Loader2 className=\"h-12 w-12 animate-spin text-primary mx-auto mb-4\" />
            <p className=\"text-muted-foreground\">Cargando producto...</p>
          </div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className=\"max-w-4xl mx-auto p-4 md:p-8\">
        <div className=\"flex items-center justify-between mb-6\">
          <div className=\"flex items-center gap-4\">
            <Link href=\"/admin/products\" passHref>
              <Button variant=\"ghost\" size=\"icon\">
                <ArrowLeft className=\"h-4 w-4\" />
              </Button>
            </Link>
            <h1 className=\"text-3xl font-black\">Editar Producto</h1>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className=\"space-y-8\">
            {/* Current Image Preview */}
            {currentImageUrl && (
              <Card className=\"p-4\">
                <h3 className=\"text-sm font-semibold mb-2\">Imagen Actual</h3>
                <div className=\"relative w-32 h-32 rounded-lg overflow-hidden border\">
                  <Image
                    src={currentImageUrl}
                    alt=\"Imagen actual\"
                    fill
                    className=\"object-cover\"
                  />
                </div>
                <p className=\"text-xs text-muted-foreground mt-2\">
                  Puedes subir una nueva imagen para reemplazarla
                 </p>
              </Card>
            )}

            <div className=\"grid grid-cols-1 md:grid-cols-2 gap-8\">
              <FormField
                control={form.control}
                name=\"name\"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Producto *</FormLabel>
                    <FormControl>
                      <Input placeholder=\"Ej: Tomahawk King\" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name=\"category\"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría *</FormLabel>
                    <FormControl>
                      <Input placeholder=\"Ej: Res\" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className=\"grid grid-cols-1 md:grid-cols-2 gap-8\">
              <FormField
                control={form.control}
                name=\"pricePerKg\"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio por Kg *</FormLabel>
                    <FormControl>
                      <Input type=\"number\" placeholder=\"Ej: 125000\" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name=\"stock\"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Disponible *</FormLabel>
                    <FormControl>
                      <Input type=\"number\" placeholder=\"Ej: 5\" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name=\"image\"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel>
                    <Upload className=\"inline mr-2 h-4 w-4\" />
                    Nueva Imagen (Opcional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type=\"file\"
                      accept=\"image/png, image/jpeg, image/webp\"
                      onChange={(e) => onChange(e.target.files)}
                      {...rest}
                    />
                  </FormControl>
                  <FormDescription>
                    Solo JPG, PNG o WebP. Máximo 5MB.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className=\"w-full bg-gray-200 rounded-full h-2\">
                <div
                  className=\"bg-primary h-2 rounded-full transition-all duration-300\"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}

            <h2 className=\"text-xl font-bold border-b pb-2 mt-10\">
              Detalles Adicionales
            </h2>

            <FormField
              control={form.control}
              name=\"corte\"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción del Corte</FormLabel>
                  <FormControl>
                    <Input
                      placeholder=\"Ej: Corte grueso con hueso de la costilla...\"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className=\"grid grid-cols-1 md:grid-cols-3 gap-8\">
              <FormField
                control={form.control}
                name=\"origen\"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origen</FormLabel>
                    <FormControl>
                      <Input placeholder=\"Ej: Angus (USA)\" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name=\"maduracion\"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maduración</FormLabel>
                    <FormControl>
                      <Input placeholder=\"Ej: 30 días\" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name=\"grasa\"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nivel de Grasa</FormLabel>
                    <FormControl>
                      <Input placeholder=\"Ej: Marmoleo A5\" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className=\"grid grid-cols-1 md:grid-cols-2 gap-8\">
              <FormField
                control={form.control}
                name=\"pairing\"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maridaje</FormLabel>
                    <FormControl>
                      <Input placeholder=\"Ej: Malbec Reserva\" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name=\"badge\"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Badge</FormLabel>
                    <FormControl>
                      <Input placeholder=\"Ej: Premium\" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className=\"flex gap-4 pt-6\">
              <Button
                type=\"button\"
                variant=\"outline\"
                onClick={() => router.push('/admin/products')}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type=\"submit\" disabled={isLoading} className=\"flex-1 md:flex-none\">
                {isLoading && <Loader2 className=\"mr-2 h-4 w-4 animate-spin\" />}
                Guardar Cambios
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminGuard>
  );
}
