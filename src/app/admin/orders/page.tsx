'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/firebase/client';
import AdminGuard from '@/components/AdminGuard';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, DollarSign, ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/data/products';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Eye, FileText, User, CreditCard, Calendar, Tag } from 'lucide-react';

interface Order {
  id: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  total: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  items: any[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchOrders() {
    setIsLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/orders/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error fetching orders');
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      toast({ type: 'error', message: 'No se pudieron cargar los pedidos.' });
    } finally {
      setIsLoading(false);
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setIsUpdating(orderId);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/orders/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: orderId, updates: { status: newStatus } }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      toast({ type: 'success', message: 'Estado actualizado correctamente.' });
    } catch (error) {
      toast({ type: 'error', message: 'Error al actualizar el estado.' });
    } finally {
      setIsUpdating(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    const searchLow = searchTerm.toLowerCase();
    return (
      order.customerName.toLowerCase().includes(searchLow) ||
      order.id.toLowerCase().includes(searchLow) ||
      order.total.toString().includes(searchLow) ||
      new Date(order.createdAt).toLocaleDateString().includes(searchLow) ||
      order.status.toLowerCase().includes(searchLow)
    );
  });

  // Calculations
  const totalSales = orders.reduce((acc, order) => acc + order.total, 0);
  const totalOrders = orders.length;
  const thisMonthSales = orders
    .filter((o) => new Date(o.createdAt).getMonth() === new Date().getMonth())
    .reduce((acc, o) => acc + o.total, 0);

  return (
    <AdminGuard>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-primary" />
              Gestión de Pedidos
            </h1>
            <p className="text-gray-500 mt-1">
              Control total sobre las transacciones y estados de envío.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por cliente, ticket, fecha..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(totalSales)}</div>
              <p className="text-xs text-muted-foreground mt-1">Acumulado histórico</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Totales</CardTitle>
              <ShoppingBag className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">Transacciones procesadas</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(thisMonthSales)}</div>
              <p className="text-xs text-muted-foreground mt-1">Ventas del mes actual</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-gray-950 rounded-xl border shadow-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
              <TableRow>
                <TableHead className="font-bold">Fecha</TableHead>
                <TableHead className="font-bold">Cliente</TableHead>
                <TableHead className="font-bold">Método</TableHead>
                <TableHead className="font-bold">Total</TableHead>
                <TableHead className="font-bold">Estado</TableHead>
                <TableHead className="text-right font-bold">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center border-none">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin h-8 w-8 text-primary" />
                      <p className="text-muted-foreground font-medium">Cargando pedidos...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center border-none">
                    <p className="text-muted-foreground font-medium">No se encontraron pedidos.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/30 transition-colors border-b dark:border-white/5">
                    <TableCell className="font-semibold text-foreground py-4">
                      {new Date(order.createdAt).toLocaleDateString('es-CO')}
                      <div className="text-[10px] text-muted-foreground font-mono">#{order.id.slice(0, 8)}</div>
                    </TableCell>
                    <TableCell className="text-foreground/90 font-bold">
                      {order.customerName || 'Invitado'}
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground text-xs">
                      {order.paymentMethod === 'whatsapp' ? 'WhatsApp Pay' : order.paymentMethod}
                    </TableCell>
                    <TableCell className="font-black text-primary">
                      {formatPrice(order.total)}
                    </TableCell>
                    <TableCell>
                      <Select
                        defaultValue={order.status}
                        onValueChange={(val) => handleStatusChange(order.id, val)}
                        disabled={isUpdating === order.id}
                      >
                        <SelectTrigger className={cn(
                          "w-[140px] font-bold h-8 border-none ring-offset-0 focus:ring-0",
                          order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-600' :
                            order.status === 'confirmed' ? 'bg-blue-500/20 text-blue-600' :
                              order.status === 'delivered' ? 'bg-green-500/20 text-green-600' :
                                'bg-muted text-muted-foreground'
                        )}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="confirmed">Confirmado</SelectItem>
                          <SelectItem value="preparing">Preparando</SelectItem>
                          <SelectItem value="shipped">Enviado</SelectItem>
                          <SelectItem value="delivered">Entregado</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <OrderDetailsModal order={order} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminGuard>
  );
}

function OrderDetailsModal({ order }: { order: Order }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:border-primary">
          <Eye className="w-4 h-4" /> Ver Detalles
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-white dark:bg-gray-950 border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            Detalles del Ticket
            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded ml-auto">
              ID: {order.id}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Cliente Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" /> Información del Cliente
            </h3>
            <div className="bg-muted/30 p-4 rounded-lg space-y-2">
              <p className="font-black text-lg">{order.customerName}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="w-3 h-3" /> {new Date(order.createdAt).toLocaleString()}
              </p>
              {order.customerPhone && (
                <p className="text-sm font-medium">WhatsApp: {order.customerPhone}</p>
              )}
              {order.customerAddress && (
                <p className="text-sm text-muted-foreground">📍 {order.customerAddress}</p>
              )}
            </div>

            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mt-6">
              <CreditCard className="w-4 h-4" /> Pago y Estado
            </h3>
            <div className="bg-muted/30 p-4 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Método:</span>
                <span className="font-bold capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Estado actual:</span>
                <Badge className={cn(
                  "font-bold",
                  order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30' :
                    order.status === 'delivered' ? 'bg-green-500/20 text-green-600 border-green-500/30' :
                      'bg-muted text-muted-foreground'
                )} variant="outline">
                  {order.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Tag className="w-4 h-4" /> Productos en Pedido
            </h3>
            <div className="bg-muted/20 border border-white/5 rounded-lg overflow-hidden">
              <div className="max-h-[300px] overflow-y-auto">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="p-3 border-b border-white/5 flex justify-between items-center hover:bg-muted/10">
                    <div>
                      <p className="font-bold text-sm">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {item.weight}kg x {formatPrice(item.pricePerKg)}/kg
                      </p>
                    </div>
                    <span className="font-black text-sm text-primary">
                      {formatPrice(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-primary/10 flex justify-between items-center">
                <span className="font-black text-sm">TOTAL A PAGAR</span>
                <span className="font-black text-xl text-primary">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
