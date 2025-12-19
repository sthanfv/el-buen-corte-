'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase/client';
import AdminGuard from '@/components/AdminGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Package, TrendingUp, Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { formatPrice } from '@/lib/salesbot-messages';

interface Ticket {
    id: string;
    ticketId: string;
    orderNumber: number;
    customerName: string;
    customerPhone: string;
    address: string;
    city: string;
    items: Array<{
        id: string;
        name: string;
        selectedWeight: number;
        finalPrice: number;
    }>;
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';
    createdAt: string;
    deliveryDate?: string;
    notes?: string;
}

interface TicketsSummary {
    totalTickets: number;
    totalAmount: number;
    byStatus: {
        pending: number;
        confirmed: number;
        preparing: number;
        delivered: number;
        cancelled: number;
    };
}

const STATUS_COLORS = {
    pending: 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50',
    confirmed: 'bg-blue-500/20 text-blue-500 border border-blue-500/50',
    preparing: 'bg-purple-500/20 text-purple-500 border border-purple-500/50',
    delivered: 'bg-green-500/20 text-green-500 border border-green-500/50',
    cancelled: 'bg-red-500/20 text-red-500 border border-red-500/50',
};

const STATUS_LABELS = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    preparing: 'Preparando',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
};

export default function VentasPage() {
    const router = useRouter();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [summary, setSummary] = useState<TicketsSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );

    useEffect(() => {
        fetchTickets();
    }, [selectedDate]);

    const fetchTickets = async () => {
        setIsLoading(true);
        try {
            const idToken = await auth.currentUser?.getIdToken();
            if (!idToken) return;

            const response = await fetch(
                `/api/tickets/list?date=${selectedDate}`,
                {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                }
            );

            if (!response.ok) throw new Error('Error al cargar ventas');

            const data = await response.json();
            setTickets(data.tickets);
            setSummary(data.summary);
        } catch (error) {
            console.error(' Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('es-CO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    return (
        <AdminGuard>
            <div className="container mx-auto p-6 max-w-7xl">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white italic uppercase tracking-tighter flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-primary" />
                        Historial de Ventas
                    </h1>
                    <p className="text-sm font-medium text-muted-foreground mt-1">
                        Auditoría completa de tickets y flujo de caja histórico.
                    </p>
                </div>

                <div className="mb-10 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-xl flex flex-wrap items-end gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fecha de Consulta</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="block w-full px-4 py-2 bg-gray-50 dark:bg-black border border-black/10 dark:border-white/10 rounded-xl font-bold focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                        />
                    </div>
                    <Button onClick={fetchTickets} className="h-11 px-8 font-black italic uppercase tracking-widest bg-black dark:bg-white dark:text-black hover:bg-primary hover:text-white transition-all duration-300">
                        Consultar Archivo
                    </Button>
                </div>

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                        <Card className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 shadow-xl hover:border-primary/30 transition-all">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Pedidos</CardTitle>
                                <Package className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black italic">{summary.totalTickets}</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-black text-white border-primary/20 shadow-2xl">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary/70">Total Ventas</CardTitle>
                                <DollarSign className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black italic text-primary">
                                    ${summary.totalAmount.toLocaleString('es-CO')}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 shadow-xl">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Entregados</CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black italic text-green-500">
                                    {summary.byStatus.delivered}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 shadow-xl">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pendientes</CardTitle>
                                <Clock className="h-4 w-4 text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black italic text-yellow-500">
                                    {summary.byStatus.pending}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Tickets List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pedidos del {selectedDate}</CardTitle>
                        <CardDescription>Lista completa de tickets generados</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <p className="text-center py-8 text-muted-foreground">Cargando...</p>
                        ) : tickets.length === 0 ? (
                            <p className="text-center py-8 text-muted-foreground">
                                No hay pedidos para esta fecha
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {tickets.map((ticket) => (
                                    <div
                                        key={ticket.id}
                                        className="group relative bg-gray-50/50 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-2xl p-6 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                                            <FileText className="w-20 h-20 rotate-12" />
                                        </div>
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="relative z-10">
                                                <h3 className="font-black text-2xl italic uppercase tracking-tighter">
                                                    {ticket.ticketId}
                                                    <span className="text-primary text-[10px] font-bold tracking-widest ml-3 px-2 py-1 bg-primary/10 rounded-full">
                                                        #{ticket.orderNumber}
                                                    </span>
                                                </h3>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mt-1">
                                                    <Clock size={12} /> {formatDate(ticket.createdAt)}
                                                </p>
                                            </div>
                                            <Badge className={STATUS_COLORS[ticket.status]}>
                                                {STATUS_LABELS[ticket.status]}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                            <div>
                                                <p className="text-sm font-medium">Cliente:</p>
                                                <p>{ticket.customerName}</p>
                                                <p className="text-sm text-muted-foreground">{ticket.customerPhone}</p>
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium">Dirección:</p>
                                                <p className="text-sm">{ticket.address}</p>
                                                <p className="text-sm text-muted-foreground">{ticket.city}</p>
                                            </div>
                                        </div>

                                        <div className="border-t pt-3">
                                            <p className="text-sm font-medium mb-2">Productos:</p>
                                            <ul className="space-y-1">
                                                {ticket.items.map((item, idx) => (
                                                    <li key={idx} className="text-sm flex justify-between">
                                                        <span>
                                                            {item.name} ({item.selectedWeight}kg)
                                                        </span>
                                                        <span className="font-medium">
                                                            ${item.finalPrice.toLocaleString('es-CO')}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="border-t border-black/5 dark:border-white/5 mt-4 pt-4 flex justify-between items-baseline">
                                                <span className="text-xs font-black uppercase text-muted-foreground italic">Total Liquidado:</span>
                                                <span className="text-3xl font-black italic text-primary">
                                                    ${ticket.totalAmount.toLocaleString('es-CO')}
                                                </span>
                                            </div>
                                        </div>

                                        {ticket.notes && (
                                            <div className="mt-3 p-2 bg-muted rounded text-sm">
                                                <strong>Notas:</strong> {ticket.notes}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminGuard>
    );
}
