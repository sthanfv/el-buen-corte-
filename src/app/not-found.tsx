'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 selection:bg-primary selection:text-white">
            <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
                <div className="relative inline-block">
                    <h1 className="text-[150px] font-black italic text-white/5 leading-none select-none">404</h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl">🥩🔥</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                        ¡Ups! Se nos <span className="text-primary italic">quemó</span> el asado
                    </h2>
                    <p className="text-gray-400 font-medium leading-relaxed">
                        Parece que el corte que buscas no está en nuestra vitrina actual o ha sido movido de lugar. No te preocupes, el parrillero ya está en camino.
                    </p>
                </div>

                <div className="pt-4">
                    <Button asChild className="h-14 px-10 bg-primary hover:bg-white hover:text-black text-white font-black italic uppercase tracking-widest rounded-none transform -skew-x-12 transition-all duration-300 shadow-2xl shadow-primary/20">
                        <Link href="/">
                            Volver a la parrilla inicial
                        </Link>
                    </Button>
                </div>

                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-600">
                    El Buen Corte • Sistema de Gestión de Cortes Premium
                </p>
            </div>
        </div>
    );
}
