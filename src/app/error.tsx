'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Loguear el error al sistema de auditoría si es crítico
        console.error('Error Crítico de Aplicación:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 selection:bg-primary">
            <div className="max-w-lg text-center space-y-10">
                <div className="relative">
                    <div className="absolute inset-0 blur-3xl bg-primary/20 rounded-full animate-pulse" />
                    <h1 className="relative text-8xl font-black italic text-primary/80 tracking-tighter">ERROR <span className="text-white">500</span></h1>
                </div>

                <div className="space-y-4 relative">
                    <h2 className="text-3xl font-black uppercase italic tracking-widest text-white">Fallo en el <span className="text-primary">Suministro</span></h2>
                    <p className="text-zinc-500 font-medium max-w-sm mx-auto">
                        Hemos detectado una anomalía técnica en el servidor. Por seguridad del <b>MANDATO-FILTRO</b>, hemos aislado la sesión.
                    </p>
                    <div className="text-[10px] font-mono text-zinc-700 bg-black p-2 rounded border border-white/5 truncate">
                        LOG_ID: {error.digest || 'UNKNOWN_SESSION_FAIL'}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                        onClick={() => reset()}
                        className="h-12 px-8 bg-white text-black hover:bg-primary hover:text-white font-black italic uppercase transition-all duration-500"
                    >
                        Reintentar Conexión
                    </Button>
                    <Button
                        asChild
                        variant="outline"
                        className="h-12 px-8 border-white/10 text-white hover:bg-white/5 font-black italic uppercase transition-all duration-500"
                    >
                        <Link href="/">Salir al Inicio</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
