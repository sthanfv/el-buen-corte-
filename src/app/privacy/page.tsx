'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ShieldCheck, UserX, Info, ArrowLeft } from 'lucide-react';
import { auth, db } from '@/firebase/client';
import { deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PrivacyProfile() {
    const { toast } = useToast();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleDeleteData() {
        const user = auth.currentUser;
        if (!user) return;

        const confirm = window.confirm(
            "¿ESTÁ SEGURO? Esta acción es IRREVERSIBLE según la Ley 1581. Borraremos su historial de pedidos, preferencias y cuenta permanentemente."
        );

        if (!confirm) return;

        setIsDeleting(true);
        try {
            // 1. Borrar datos de Firestore (Derecho al Olvido)
            await deleteDoc(doc(db, 'users', user.uid));

            // 2. Borrar Auth (Cierre de ciclo legal)
            await deleteUser(user);

            toast({
                type: 'success',
                message: 'Sus datos han sido eliminados de acuerdo a la Ley 1581. Gracias por su confianza.'
            });
            router.push('/');
        } catch (err: any) {
            toast({
                type: 'error',
                message: 'Error al procesar la solicitud. Por favor contacte a soporte legal@buencorte.co'
            });
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 p-6 sm:p-12">
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                <Link href="/" className="inline-flex items-center text-sm font-bold text-primary gap-2 hover:underline">
                    <ArrowLeft size={16} /> Volver a la Tienda
                </Link>

                <div className="space-y-2">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter">
                        Privacidad & <span className="text-primary">Habeas Data</span>
                    </h1>
                    <p className="text-muted-foreground font-medium">Ley 1581 de 2012 - Colombia</p>
                </div>

                <Card className="border-none shadow-2xl bg-zinc-50 dark:bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg font-black uppercase italic">
                            <ShieldCheck className="text-primary" /> Política de Tratamiento de Datos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                        <p>
                            En <b>El Buen Corte</b>, su privacidad es nuestra prioridad técnica. Los datos recolectados (Nombre, Teléfono, Dirección) tienen como única finalidad la logística de entrega y facturación de sus pedidos premium.
                        </p>
                        <div className="p-4 bg-white dark:bg-black rounded-lg border border-black/5 dark:border-white/5 space-y-2">
                            <p className="font-bold flex items-center gap-2"><Info size={14} className="text-primary" /> Sus derechos:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Acceder y rectificar su información personal.</li>
                                <li>Revocar la autorización de tratamiento en cualquier momento.</li>
                                <li>Ser informado sobre el uso de sus datos.</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                <div className="pt-8 border-t border-black/5 dark:border-white/5">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30">
                        <div className="space-y-1">
                            <h3 className="font-black uppercase text-red-600 dark:text-red-400 flex items-center gap-2 italic">
                                <UserX size={18} /> Derecho al Olvido
                            </h3>
                            <p className="text-xs text-red-800/60 dark:text-red-400/60 font-medium">
                                Borrar definitivamente su cuenta y registros de nuestra infraestructura.
                            </p>
                        </div>
                        <Button
                            onClick={handleDeleteData}
                            disabled={isDeleting}
                            variant="destructive"
                            className="font-black italic uppercase tracking-widest px-8 h-12 shadow-lg shadow-red-500/20"
                        >
                            {isDeleting ? 'Borrando...' : 'ELIMINAR MIS DATOS'}
                        </Button>
                    </div>
                </div>

                <p className="text-center text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                    Oficina de Cumplimiento Técnico • El Buen Corte S.A.S
                </p>
            </div>
        </div>
    );
}
