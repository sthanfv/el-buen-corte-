'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/types/products';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Edit } from 'lucide-react';
import { formatPrice } from '@/data/products';
import AdminGuard from '@/components/AdminGuard';
import { auth } from '@/firebase/client'; // Corrected import

type ProductWithId = Product & { id: string };

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  async function fetchProducts() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/products/list');
      if (!res.ok) throw new Error('Failed to fetch products');
      const fetchedProducts: ProductWithId[] = await res.json();
      setProducts(fetchedProducts);
    } catch (error) {
      console.error(error);
      toast({
        type: 'error',
        title: 'Error al Cargar',
        message: 'No se pudieron obtener los productos desde la API.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id: string) {
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/products/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Fallo al eliminar el producto');
      }

      toast({
        type: 'success',
        title: 'Producto Eliminado',
        message: 'El producto ha sido eliminado del catálogo.',
      });
      // Actualizar el estado local para reflejar el cambio inmediatamente
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error(error);
      toast({
        type: 'error',
        title: 'Error al Eliminar',
        message:
          error instanceof Error
            ? error.message
            : 'No se pudo eliminar el producto.',
      });
    }
  }

  return (
    <AdminGuard>
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">
              Gestión de Productos
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Añade, edita o elimina cortes del catálogo.
            </p>
          </div>
          <Link href="/admin/products/new" passHref>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Producto
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-gray-100 dark:bg-gray-800/50 rounded-xl border border-dashed">
            <h3 className="text-xl font-bold">No hay productos</h3>
            <p className="text-muted-foreground mt-2">
              Empieza añadiendo tu primer producto al catálogo.
            </p>
            <Link href="/admin/products/new" passHref>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Crear Producto
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <Card key={p.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{p.name}</CardTitle>
                      <Badge variant="secondary" className="mt-2">
                        {p.category}
                      </Badge>
                    </div>
                    <div className="relative w-16 h-16 rounded-md overflow-hidden border">
                      <Image
                        src={
                          p.images?.[0]?.src || 'https://placehold.co/100x100'
                        }
                        alt={p.images?.[0]?.alt || p.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-lg font-bold text-primary">
                    {formatPrice(p.pricePerKg)}
                    <span className="text-sm font-normal text-muted-foreground">
                      / Kg
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Stock: {p.stock} unidades
                  </p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/products/edit/${p.id}`}>
                      <Edit className="mr-2 h-3 w-3" />
                      Editar
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-3 w-3" />
                        Eliminar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Esto eliminará
                          permanentemente el producto &quot;{p.name}&quot; de la
                          base de datos.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(p.id)}>
                          Sí, eliminar producto
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
