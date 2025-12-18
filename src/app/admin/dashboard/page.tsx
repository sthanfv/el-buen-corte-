'use client';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/client'; // Corrected import
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import AdminGuard from '@/components/AdminGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingBag, ArrowRight, Settings } from 'lucide-react';

export default function Dashboard() {
  const { toast } = useToast();

  async function logout() {
    await signOut(auth);
    toast({ type: 'info', message: 'Sesión finalizada' });
  }

  return (
    <AdminGuard>
      <div className="p-4 md:p-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-foreground">
              Panel administrador
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestiona tu negocio desde un solo lugar.
            </p>
          </div>

        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Productos
                <Package className="text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/admin/products">
                  Gestionar Productos
                  <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Pedidos
                <ShoppingBag className="text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/admin/orders">Ver Pedidos</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Configuración
                <Settings className="text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" className="w-full">
                <Link href="/admin/settings">Editar Sitio</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminGuard>
  );
}
