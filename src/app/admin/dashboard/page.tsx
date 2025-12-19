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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 selection:bg-primary selection:text-white">
        <div className="mb-12">
          <h1 className="text-5xl font-black text-foreground tracking-tighter italic uppercase leading-none mb-2">
            Panel <span className="text-primary italic">Administrador</span>
          </h1>
          <p className="text-gray-500 font-medium tracking-tight">
            Control centralizado de operaciones y comunidad.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          {/* PRODUCTOS */}
          <Card className="group relative overflow-hidden bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
              <Package className="w-12 h-12 text-primary rotate-12" />
            </div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-2xl font-black italic uppercase tracking-tighter mb-1">Cortes</CardTitle>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Gestiona el inventario, precios y descripciones de tus productos estrella.
              </p>
            </CardHeader>
            <CardContent className="relative z-10">
              <Button asChild className="w-full h-12 bg-black dark:bg-zinc-800 hover:bg-primary text-white font-black italic uppercase tracking-widest transition-all duration-300">
                <Link href="/admin/products">
                  Gestionar
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* PEDIDOS */}
          <Card className="group relative overflow-hidden bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
              <ShoppingBag className="w-12 h-12 text-primary rotate-12" />
            </div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-2xl font-black italic uppercase tracking-tighter mb-1">Pedidos</CardTitle>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Visualiza y procesa las compras de tus clientes en tiempo real.
              </p>
            </CardHeader>
            <CardContent className="relative z-10">
              <Button asChild className="w-full h-12 bg-black dark:bg-zinc-800 hover:bg-primary text-white font-black italic uppercase tracking-widest transition-all duration-300">
                <Link href="/admin/orders">
                  Ver Lista
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* EXPERIENCIAS */}
          <Card className="group relative overflow-hidden bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
              <Star className="w-12 h-12 text-primary rotate-12" />
            </div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-2xl font-black italic uppercase tracking-tighter mb-1">Experiencias</CardTitle>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Modera comentarios, aprueba IPs y gestiona la lista negra de usuarios.
              </p>
            </CardHeader>
            <CardContent className="relative z-10">
              <Button asChild className="w-full h-12 bg-primary hover:bg-black dark:hover:bg-zinc-800 text-white font-black italic uppercase tracking-widest transition-all duration-300">
                <Link href="/admin/experiences">
                  Moderar
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* CONFIGURACIÓN */}
          <Card className="group relative overflow-hidden bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 hover:border-black transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
              <Settings className="w-12 h-12 text-gray-500 rotate-12" />
            </div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-2xl font-black italic uppercase tracking-tighter mb-1">Ajustes</CardTitle>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Configura parámetros globales del sitio y personalización técnica.
              </p>
            </CardHeader>
            <CardContent className="relative z-10">
              <Button asChild variant="secondary" className="w-full h-12 font-black italic uppercase tracking-widest transition-all duration-300">
                <Link href="/admin/settings">
                  Editar
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminGuard>
  );
}

import { Star } from 'lucide-react';
