'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase/client';
import AdminGuard from '@/components/AdminGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Package, TrendingUp, Clock, CheckCircle2, XCircle } from 'lucide-react';
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
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black">📊 Historial de Ventas</h1>
                        <p className="text-muted-foreground mt-2">
                            Consulta todos los pedidos y tickets generados
                        </p>
                    </div>
                </div>

                {/* Date Filter */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Fecha de Consulta:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-4 py-2 border rounded-lg"
                    />
                    <Button onClick={fetchTickets} className="ml-4">
                        Consultar
                    </Button>
                </div>

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.totalTickets}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ${summary.totalAmount.toLocaleString('es-CO')}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Entregados</CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    {summary.byStatus.delivered}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                                <Clock className="h-4 w-4 text-yellow-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-600">
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
                                        className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="font-semibold text-lg">
                                                    {ticket.ticketId}
                                                    <span className="text-muted-foreground text-sm ml-2">
                                                        #{ticket.orderNumber}
                                                    </span>
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDate(ticket.createdAt)}
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
                                            <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                                                <span>TOTAL:</span>
                                                <span className="text-primary">
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
