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
import {
  Search,
  Eye,
  FileText,
  User,
  CreditCard,
  Calendar,
  Tag,
  BarChart3,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RetentionDashboard } from '@/components/admin/RetentionDashboard';

import { Order } from '@/schemas/order';

interface OrderWithId extends Order {
  id: string;
}

import { autoCancelExpiredOrders } from '@/lib/order-utils';

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithId[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ AUTO-CANCEL (MANDATO-FILTRO)
  useEffect(() => {
    if (orders.length > 0) {
      autoCancelExpiredOrders(
        orders,
        (id, data) => handleStatusChange(id, data.status as string),
        (order) => console.log('Restoring stock for order', order.id) // TODO: Implement real stock restore API
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  async function fetchOrders() {
    setIsLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/orders/list', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
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

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: newStatus as any } : o
        )
      );
      toast({ type: 'success', message: 'Estado actualizado correctamente.' });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error al actualizar el estado.';
      toast({ type: 'error', message: errorMessage });
    } finally {
      setIsUpdating(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const searchLow = searchTerm.toLowerCase();
    const customerName = (order.customerInfo?.customerName || '').toLowerCase();
    const orderId = (order.id || '').toLowerCase();
    const total = order.total?.toString() || '';
    const status = (order.status || '').toLowerCase();
    const date = order.createdAt
      ? new Date(order.createdAt).toLocaleDateString('es-CO').toLowerCase()
      : '';

    return (
      customerName.includes(searchLow) ||
      orderId.includes(searchLow) ||
      total.includes(searchLow) ||
      date.includes(searchLow) ||
      status.includes(searchLow)
    );
  });

  // Calculations
  const totalSales = orders.reduce((acc, order) => acc + order.total, 0);
  const totalOrders = orders.length;
  const thisMonthSales = orders
    .filter(
      (o) =>
        o.createdAt &&
        new Date(o.createdAt).getMonth() === new Date().getMonth()
    )
    .reduce((acc, o) => acc + o.total, 0);

  return (
    <AdminGuard>
      <div className="space-y-6 animate-in fade-in duration-500">
        <Tabs defaultValue="operational" className="w-full">
          <TabsList className="bg-secondary/50 p-1 rounded-xl mb-8">
            <TabsTrigger
              value="operational"
              className="rounded-lg font-bold uppercase text-[10px] tracking-widest gap-2"
            >
              <ShoppingBag size={14} /> Gestión Operativa
            </TabsTrigger>
            <TabsTrigger
              value="retention"
              className="rounded-lg font-bold uppercase text-[10px] tracking-widest gap-2"
            >
              <BarChart3 size={14} /> Analítica de Retención
            </TabsTrigger>
          </TabsList>

          <TabsContent value="operational" className="space-y-6">
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

              {/* ✅ RESUMEN DIARIO (MANDATO-FILTRO) */}
              <DailySummaryDialog orders={orders} />
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Ventas Totales
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatPrice(totalSales)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Acumulado histórico
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pedidos Totales
                  </CardTitle>
                  <ShoppingBag className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalOrders}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Transacciones procesadas
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Este Mes
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatPrice(thisMonthSales)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ventas del mes actual
                  </p>
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
                    <TableHead className="text-right font-bold">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-48 text-center border-none"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="animate-spin h-8 w-8 text-primary" />
                          <p className="text-muted-foreground font-medium">
                            Cargando pedidos...
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-48 text-center border-none"
                      >
                        <p className="text-muted-foreground font-medium">
                          No se encontraron pedidos.
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => {
                      // ✅ Semáforo de Pedidos Expirados
                      const now = new Date();
                      const orderDate = order.createdAt
                        ? new Date(order.createdAt)
                        : now;
                      const diffInHours =
                        (now.getTime() - orderDate.getTime()) /
                        (1000 * 60 * 60);

                      // Lógica de color para expirados (>1h en WAITING_PAYMENT)
                      let rowClass =
                        'hover:bg-muted/30 transition-colors border-b dark:border-white/5';
                      if (
                        order.status === 'WAITING_PAYMENT' &&
                        diffInHours > 1
                      ) {
                        rowClass =
                          'bg-red-50 border-l-4 border-l-red-500 hover:bg-red-100 transition-colors border-b dark:border-white/5';
                      }

                      return (
                        <TableRow key={order.id} className={rowClass}>
                          <TableCell className="font-semibold text-foreground py-4">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString(
                                  'es-CO'
                                )
                              : 'N/A'}
                            <div className="text-[10px] text-muted-foreground font-mono">
                              #{order.id.slice(0, 8)}
                            </div>
                          </TableCell>
                          <TableCell className="text-foreground/90 font-bold">
                            {order.customerInfo?.customerName || 'Invitado'}
                          </TableCell>
                          <TableCell className="capitalize text-muted-foreground text-xs">
                            {order.paymentMethod}
                          </TableCell>
                          <TableCell className="font-black text-primary">
                            {formatPrice(order.total)}
                          </TableCell>
                          <TableCell>
                            {/* ⚠️ Alerta Visual de expiración */}
                            {order.status === 'WAITING_PAYMENT' &&
                              diffInHours > 1 && (
                                <div className="text-xs font-bold text-red-600 flex items-center gap-1 mb-1 animate-pulse">
                                  ⚠️ EXPIRADO ({Math.floor(diffInHours)}h)
                                </div>
                              )}
                            <Select
                              value={order.status || 'CREATED'}
                              onValueChange={(val) =>
                                handleStatusChange(order.id, val)
                              }
                              disabled={isUpdating === order.id}
                            >
                              <SelectTrigger
                                className={cn(
                                  'w-[140px] font-bold h-8 border-none ring-offset-0 focus:ring-0',
                                  order.status === 'WAITING_PAYMENT'
                                    ? 'bg-orange-500/20 text-orange-600'
                                    : order.status === 'PAID_VERIFIED'
                                      ? 'bg-blue-500/20 text-blue-600'
                                      : order.status === 'DELIVERED'
                                        ? 'bg-green-500/20 text-green-600'
                                        : order.status === 'CREATED'
                                          ? 'bg-gray-500/20 text-gray-600'
                                          : 'bg-zinc-800 text-zinc-400'
                                )}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="CREATED">Creado</SelectItem>
                                <SelectItem value="WAITING_PAYMENT">
                                  Esperando Pago
                                </SelectItem>
                                <SelectItem value="PAID_VERIFIED">
                                  Pago Verificado
                                </SelectItem>
                                <SelectItem
                                  value="CUTTING"
                                  disabled={
                                    order.status !== 'PAID_VERIFIED' &&
                                    order.status !== 'CUTTING' &&
                                    order.status !== 'PACKING'
                                  }
                                  className={
                                    order.status !== 'PAID_VERIFIED' &&
                                    order.status !== 'CUTTING' &&
                                    order.status !== 'PACKING'
                                      ? 'text-muted-foreground line-through opacity-50'
                                      : ''
                                  }
                                >
                                  En Corte 🔪 (Req. Pago)
                                </SelectItem>
                                <SelectItem value="PACKING">
                                  Empacando
                                </SelectItem>
                                <SelectItem value="ROUTING">En Ruta</SelectItem>
                                <SelectItem value="DELIVERED">
                                  Entregado
                                </SelectItem>
                                <SelectItem value="CANCELLED_TIMEOUT">
                                  Cancelado (Timeout)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right">
                            <OrderDetailsModal
                              order={order}
                              onStatusChange={(status) =>
                                handleStatusChange(order.id, status)
                              }
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="retention">
            <RetentionDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </AdminGuard>
  );
}

function OrderDetailsModal({
  order,
  onStatusChange,
}: {
  order: OrderWithId;
  onStatusChange?: (status: string) => void;
}) {
  const { toast } = useToast();

  const handleWhatsAppNotification = () => {
    // 1. Limpieza del número: Quitar todo lo que no sea dígito
    let rawPhone = order.customerInfo.customerPhone.replace(/\D/g, '');

    // 2. Lógica inteligente para Colombia (Evitar doble 57)
    // Si el usuario escribió "57300..." -> lo dejamos así.
    // Si escribió "300..." -> le agregamos el 57.
    let finalPhone = '';
    if (rawPhone.startsWith('57') && rawPhone.length > 10) {
      finalPhone = rawPhone;
    } else {
      finalPhone = `57${rawPhone}`;
    }

    const message = encodeURIComponent(
      `*¡Hola ${order.customerInfo.customerName}!* 👋\n\n` +
        `Tu pedido *#${order.id.slice(0, 8)}* en *El Buen Corte* ha sido recibido con éxito.\n\n` +
        `*Resumen del Pedido:*\n` +
        `${order.items.map((i) => `- ${i.name} (${i.selectedWeight.toFixed(2)}kg)`).join('\n')}\n\n` +
        `*Total:* ${formatPrice(order.total)}\n` +
        `*Estado Actual:* ${order.status.toUpperCase()}\n\n` +
        `¡Gracias por preferir nuestros cortes premium! 🥩✨`
    );

    // 3. Abrir link SIN símbolos extraños
    window.open(`https://wa.me/${finalPhone}?text=${message}`, '_blank');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-primary/20 hover:border-primary"
        >
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
            <div className="bg-muted/30 p-4 rounded-lg space-y-2 border border-black/5">
              <p className="font-black text-lg">
                {order.customerInfo.customerName}
              </p>
              <p className="text-xs font-bold text-primary flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                Realizado el:{' '}
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleString('es-CO', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true,
                    })
                  : 'N/A'}
              </p>
              {order.customerInfo.customerPhone && (
                <div className="pt-2">
                  <p className="text-sm font-medium mb-2">
                    WhatsApp: {order.customerInfo.customerPhone}
                  </p>
                  <Button
                    onClick={handleWhatsAppNotification}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xs gap-2 h-9"
                  >
                    <ShoppingBag className="w-4 h-4" /> Notificar por WhatsApp
                  </Button>
                </div>
              )}
              {order.customerInfo.customerAddress && (
                <p className="text-sm text-muted-foreground mt-2">
                  📍 {order.customerInfo.customerAddress}
                </p>
              )}
            </div>

            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mt-6">
              <CreditCard className="w-4 h-4" /> Pago y Estado
            </h3>
            <div className="bg-muted/30 p-4 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Método Pago:</span>
                <span className="font-bold capitalize text-primary">
                  {order.paymentMethod}
                </span>
              </div>

              {/* ✅ CONCILIACIÓN FINANCIERA (MANDATO-FILTRO) */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <label className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">
                  Código de Transacción / Comprobante
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ej: NEQ-123456"
                    className="h-8 text-xs font-mono"
                    defaultValue={order.transactionId || ''}
                    onBlur={async (e) => {
                      if (
                        e.target.value &&
                        e.target.value !== order.transactionId
                      ) {
                        try {
                          const token = await auth.currentUser?.getIdToken();
                          const res = await fetch('/api/orders/update', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              id: order.id,
                              updates: { transactionId: e.target.value },
                            }),
                          });
                          if (res.ok)
                            toast({
                              type: 'success',
                              message: 'Código de transacción guardado.',
                            });
                        } catch (err) {
                          toast({
                            type: 'error',
                            message: 'Error al guardar el código.',
                          });
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Force Flow: Quick Actions */}
              {order.status === 'WAITING_PAYMENT' && (
                <Button
                  onClick={() => onStatusChange?.('PAID_VERIFIED')}
                  className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  <DollarSign className="w-4 h-4 mr-2" /> Marcar Pago Recibido
                </Button>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-white/5 mt-2">
                <span className="text-sm font-medium">Estado del Pedido:</span>
                <Badge
                  className={cn(
                    'font-bold text-[10px] tracking-widest uppercase'
                  )}
                  variant={
                    order.status === 'WAITING_PAYMENT'
                      ? 'destructive'
                      : order.status === 'PAID_VERIFIED'
                        ? 'success'
                        : order.status === 'DELIVERED'
                          ? 'default'
                          : order.status === 'CREATED'
                            ? 'secondary'
                            : 'outline'
                  }
                >
                  {order.status === 'CREATED'
                    ? 'CREADO'
                    : order.status === 'WAITING_PAYMENT'
                      ? 'ESPERANDO PAGO'
                      : order.status === 'PAID_VERIFIED'
                        ? 'PAGO VERIFICADO'
                        : order.status === 'CUTTING'
                          ? 'EN CORTE'
                          : order.status === 'PACKING'
                            ? 'EMPACANDO'
                            : order.status === 'ROUTING'
                              ? 'EN RUTA'
                              : order.status === 'DELIVERED'
                                ? 'ENTREGADO'
                                : order.status === 'CANCELLED_TIMEOUT'
                                  ? 'TIMEOUT'
                                  : order.status}
                </Badge>
              </div>
            </div>

            {/* ✅ LÍNEA DE TIEMPO / AUDITORÍA (MANDATO-FILTRO) */}
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mt-6">
              <BarChart3 className="w-4 h-4" /> Línea de Tiempo (Observabilidad)
            </h3>
            <div className="bg-muted/10 border border-white/5 p-4 rounded-lg space-y-4 max-h-[200px] overflow-y-auto">
              {order.history && order.history.length > 0 ? (
                order.history.map((h, i: number) => {
                  const isDelayed =
                    h.status === 'CUTTING' &&
                    (h.durationMs || 0) > 20 * 60 * 1000; // Alerta > 20 min
                  return (
                    <div
                      key={i}
                      className="flex gap-3 relative pb-2 border-l-2 border-primary/20 ml-2 pl-4"
                    >
                      <div
                        className={cn(
                          'absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-gray-950',
                          isDelayed ? 'bg-red-500 animate-ping' : 'bg-primary'
                        )}
                      />
                      <div>
                        <p className="text-[10px] font-black uppercase text-foreground">
                          {h.status}
                        </p>
                        <p className="text-[9px] text-muted-foreground">
                          {h.timestamp
                            ? new Date(h.timestamp).toLocaleString()
                            : 'N/A'}
                        </p>
                        {isDelayed && (
                          <p className="text-[9px] text-red-500 font-bold mt-1">
                            ⚠️ BANDERA ROJA: Retraso detectado en producción
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground italic text-center">
                  Iniciando trazabilidad...
                </p>
              )}
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
                  <div
                    key={idx}
                    className="p-3 border-b border-white/5 flex justify-between items-center hover:bg-muted/10"
                  >
                    <div>
                      <p className="font-bold text-sm italic uppercase tracking-tight">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-medium">
                        {item.selectedWeight.toFixed(2)}kg x{' '}
                        {formatPrice(item.pricePerKg)}/kg
                      </p>
                    </div>
                    <span className="font-black text-sm text-primary italic">
                      {formatPrice(item.finalPrice)}
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

function DailySummaryDialog({ orders }: { orders: OrderWithId[] }) {
  const [isOpen, setIsOpen] = useState(false);

  // Calcular métricas al abrir (o renderizar)
  const today = new Date();
  const isToday = (dateString?: string) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  const todayDelivered = orders.filter(
    (o) => o.status === 'DELIVERED' && isToday(o.deliveredAt || o.updatedAt) // Fallback to updatedAt if deliveredAt missing legacy
  );

  const totalOrders = todayDelivered.length;
  const totalSales = todayDelivered.reduce((acc, o) => acc + o.total, 0);
  const totalCash = todayDelivered
    .filter((o) => o.paymentMethod === 'efectivo')
    .reduce((acc, o) => acc + o.total, 0);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-dashed">
          <BarChart3 className="w-4 h-4" /> Resumen del Día
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm bg-white dark:bg-gray-950">
        <DialogHeader>
          <DialogTitle>📊 Cierre de Caja Diario</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-muted-foreground">Pedidos Entregados:</span>
            <span className="font-bold text-xl">{totalOrders}</span>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-muted-foreground">Ventas Totales:</span>
            <span className="font-bold text-xl text-primary">
              {formatPrice(totalSales)}
            </span>
          </div>
          <div className="flex justify-between items-center bg-green-50 p-2 rounded dark:bg-green-900/20">
            <span className="text-green-700 font-bold dark:text-green-400">
              Total Efectivo (Caja):
            </span>
            <span className="font-black text-xl text-green-700 dark:text-green-400">
              {formatPrice(totalCash)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground text-center pt-4">
            * Se consideran solo pedidos en estado ENTREGADO con fecha de hoy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
