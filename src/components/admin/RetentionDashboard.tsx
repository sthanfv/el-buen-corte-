'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
import { auth } from '@/firebase/client';
import { formatPrice } from '@/data/products';

interface CohortRow {
    month: string;
    size: number;
    retention: { [m: number]: number };
}

interface LTVUser {
    id: string;
    ltv: number;
    orderCount: number;
    lastOrderDays: number;
}

export function RetentionDashboard() {
    const [data, setData] = useState<{ retention: CohortRow[], ltv: LTVUser[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                const token = await auth.currentUser?.getIdToken();
                const res = await fetch('/api/admin/analytics/retention', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    setData(await res.json());
                }
            } catch (error) {
                console.error('Error fetching analytics', error);
            } finally {
                setLoading(false);
            }
        }
        fetchAnalytics();
    }, []);

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" /></div>;
    if (!data) return <div className="text-center p-10 text-muted-foreground uppercase font-black italic">No hay datos suficientes para generar analítica.</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* KPI OVERVIEW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-black text-white border-primary/20 shadow-2xl">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase text-primary tracking-widest italic">LTV Promedio (Top 20)</p>
                                <h3 className="text-4xl font-black italic leading-none">
                                    {formatPrice(data.ltv.reduce((a, b) => a + b.ltv, 0) / (data.ltv.length || 1))}
                                </h3>
                            </div>
                            <DollarSign className="text-primary w-8 h-8" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-zinc-900 border-black/5 shadow-xl">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase text-gray-500 tracking-widest italic">Retención Mes 1 (Promedio)</p>
                                <h3 className="text-4xl font-black italic leading-none">
                                    {(data.retention.reduce((a, b) => a + (b.retention[1] || 0), 0) / (data.retention.filter(r => r.retention[1]).length || 1)).toFixed(1)}%
                                </h3>
                            </div>
                            <TrendingUp className="text-green-500 w-8 h-8" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-zinc-900 border-black/5 shadow-xl">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase text-gray-500 tracking-widest italic">Total Cohortes</p>
                                <h3 className="text-4xl font-black italic leading-none">{data.retention.length}</h3>
                            </div>
                            <Calendar className="text-blue-500 w-8 h-8" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* COHORT TABLE */}
            <Card className="border-none shadow-2xl overflow-hidden">
                <CardHeader className="bg-secondary/50 border-b">
                    <CardTitle className="text-2xl font-black uppercase italic italic flex items-center gap-3">
                        <Users className="text-primary" /> Análisis de Cohortes de Retención
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-secondary/20 border-b">
                                <th className="p-4 text-xs font-black uppercase italic">Cohorte (Mes)</th>
                                <th className="p-4 text-xs font-black uppercase italic">Tamaño</th>
                                <th className="p-4 text-xs font-black uppercase italic text-center">Mes 1</th>
                                <th className="p-4 text-xs font-black uppercase italic text-center">Mes 2</th>
                                <th className="p-4 text-xs font-black uppercase italic text-center">Mes 3+</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.retention.slice().reverse().map((row) => (
                                <tr key={row.month} className="border-b hover:bg-secondary/10 transition-colors">
                                    <td className="p-4 font-black italic text-primary">{row.month}</td>
                                    <td className="p-4 font-bold">{row.size} Clientes</td>
                                    {[1, 2, 3].map(m => (
                                        <td key={m} className="p-4 text-center">
                                            {row.retention[m] ? (
                                                <Badge className={cn(
                                                    "font-bold italic w-16 justify-center",
                                                    row.retention[m] > 30 ? "bg-green-600" : row.retention[m] > 15 ? "bg-yellow-600" : "bg-red-600"
                                                )}>
                                                    {row.retention[m].toFixed(0)}%
                                                </Badge>
                                            ) : <span className="text-gray-300">-</span>}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* TOP LTV CLIENTS */}
            <Card className="border-none shadow-2xl overflow-hidden">
                <CardHeader className="bg-black text-white">
                    <CardTitle className="text-xl font-black uppercase italic flex items-center gap-3">
                        <DollarSign className="text-primary" /> Top 20 Clientes por Valor (LTV)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {data.ltv.map((user, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-secondary/30 border border-black/5 space-y-2">
                                <p className="text-[10px] font-black uppercase text-gray-500 truncate">{user.id}</p>
                                <div className="flex justify-between items-end">
                                    <span className="text-xl font-black text-primary leading-none italic">{formatPrice(user.ltv)}</span>
                                    <Badge variant="outline" className="text-[10px] font-bold h-5">{user.orderCount} Pedidos</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
