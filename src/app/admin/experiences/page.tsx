'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, X, Shield, MessageSquare, XOctagon } from 'lucide-react';
import { auth } from '@/firebase/client';
import AdminGuard from '@/components/AdminGuard';

// Since I cannot use adminDb directly in 'use client', I'll create an internal API for admin actions or use the Firebase Client SDK with proper rules.
// For this implementation, I'll assume we have a secure API route for admin actions.

export default function AdminExperiencesPage() {
    const { toast } = useToast();
    const [requests, setRequests] = useState<any[]>([]);
    const [comments, setComments] = useState<any[]>([]);
    const [bannedIps, setBannedIps] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

            const [resReq, resCom, resBan] = await Promise.all([
                fetch('/api/admin/experiences/requests', { headers }),
                fetch('/api/admin/experiences/comments', { headers }),
                fetch('/api/admin/experiences/ban', { headers })
            ]);

            if (resReq.status === 403 || resCom.status === 403) {
                toast({ title: 'Acceso Denegado', message: 'No tienes permisos para ver estos datos.', type: 'error' });
                return;
            }

            if (resReq.ok) setRequests(await resReq.json());
            if (resCom.ok) setComments(await resCom.json());
            if (resBan.ok) setBannedIps(await resBan.json());
        } catch (error) {
            console.error('Error fetching admin data', error);
            toast({ title: 'Error', message: 'No se pudieron cargar los datos.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAction = async (type: 'request' | 'comment' | 'ip', id: string, action: 'approve' | 'reject' | 'ban') => {
        try {
            let url = '';
            let method = 'PATCH';
            let body: any = { action };

            if (type === 'ip') {
                url = '/api/admin/experiences/ban';
                method = 'POST';
                body = { ip: id, reason: 'Abuso detectado desde el panel administrativo' };
            } else {
                url = `/api/admin/experiences/${type}/${id}`;
            }

            const token = await auth.currentUser?.getIdToken();
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                toast({ title: 'Éxito', message: `Acción ${action} realizada con éxito.`, type: 'success' });
                fetchData();
            } else {
                toast({ title: 'Error', message: 'No se pudo realizar la acción.', type: 'error' });
            }
        } catch (error) {
            toast({ title: 'Error', message: 'Error de conexión.', type: 'error' });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
        );
    }

    return (
        <AdminGuard>
            <div className="p-8 space-y-8 bg-background min-h-screen text-foreground">
                <header className="mb-12">
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white italic uppercase tracking-tighter flex items-center gap-3">
                        <Shield className="w-10 h-10 text-primary" />
                        Comunidad & Moderación
                    </h1>
                    <p className="text-sm font-medium text-muted-foreground mt-1">
                        Control de solicitudes de reserva, comentarios y seguridad de IPs.
                    </p>
                </header>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* SOLICITUDES DE RESERVA */}
                    <Card className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 shadow-xl">
                        <CardHeader className="border-b dark:border-white/5 bg-gray-50/50 dark:bg-black/20">
                            <CardTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                                <Check className="w-5 h-5 text-green-500" /> Solicitudes de reserva
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {requests.length === 0 && <p className="text-muted-foreground text-sm">No hay solicitudes pendientes.</p>}
                            {requests.map((req) => (
                                <div key={req.ip} className="p-4 rounded-lg border border-white/5 bg-black/20 flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold">{req.fullName}</span>
                                            <Badge variant={req.status === 'pending' ? 'outline' : 'default'}>{req.status}</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-2">IP: {req.ip}</p>
                                        <p className="text-sm italic text-gray-400">"{req.reason}"</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {req.status === 'pending' && (
                                            <>
                                                <Button size="sm" variant="outline" className="border-green-500/50 hover:bg-green-500/20" onClick={() => handleAction('request', req.ip, 'approve')}>
                                                    <Check size={14} className="text-green-500" />
                                                </Button>
                                                <Button size="sm" variant="outline" className="border-red-500/50 hover:bg-red-500/20" onClick={() => handleAction('request', req.ip, 'reject')}>
                                                    <X size={14} className="text-red-500" />
                                                </Button>
                                            </>
                                        )}
                                        <Button size="sm" variant="outline" className="border-red-900/50 hover:bg-red-900/20" onClick={() => handleAction('ip', req.ip, 'ban')}>
                                            <XOctagon size={14} className="text-red-600" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* COMENTARIOS */}
                    <Card className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 shadow-xl">
                        <CardHeader className="border-b dark:border-white/5 bg-gray-50/50 dark:bg-black/20">
                            <CardTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-blue-500" /> Moderación de Comentarios
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {comments.length === 0 && <p className="text-muted-foreground text-sm">No hay comentarios para moderar.</p>}
                            {comments.map((com) => (
                                <div key={com.id} className="p-4 rounded-lg border border-white/5 bg-black/20 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="font-bold block">{com.authorName}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono">IP: {com.ip}</span>
                                                <span className="text-xs text-primary uppercase font-bold tracking-widest">{com.category}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {!com.approved && (
                                                <>
                                                    <Button size="sm" variant="outline" className="border-green-500/50 hover:bg-green-500/20" onClick={() => handleAction('comment', com.id, 'approve')}>
                                                        <Check size={14} className="text-green-500" />
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="border-red-500/50 hover:bg-red-500/20" onClick={() => handleAction('comment', com.id, 'reject')}>
                                                        <X size={14} className="text-red-500" />
                                                    </Button>
                                                </>
                                            )}
                                            <Button size="sm" variant="outline" className="border-red-900/50 hover:bg-red-900/20" onClick={() => handleAction('ip', com.ip, 'ban')}>
                                                <XOctagon size={14} className="text-red-600" />
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-300">"{com.content}"</p>
                                    <div className="flex gap-1">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <span key={i} className={i < com.rating ? "text-yellow-500" : "text-gray-600"}>★</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* BLACKLIST SECTION */}
                <Card className="border-red-900/30 bg-red-950/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-500">
                            <XOctagon className="w-5 h-5" /> Blacklist (IPs Baneadas)
                            <Badge variant="destructive" className="ml-2 bg-red-600">{bannedIps.length}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {bannedIps.map(ip => (
                                <Badge key={ip} variant="outline" className="border-red-900 text-red-700 font-mono italic">
                                    {ip}
                                </Badge>
                            ))}
                            {bannedIps.length === 0 && <p className="text-muted-foreground text-sm italic text-center w-full">No hay IPs en la lista negra.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminGuard>
    );
}
