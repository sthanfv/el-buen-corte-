import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, Sparkles, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CatalogPage() {
    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <Flame className="absolute top-1/4 left-1/4 w-96 h-96 text-primary blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary blur-3xl rounded-full translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="max-w-xl w-full z-10 text-center space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <div className="mx-auto w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30">
                    <ShoppingBag className="w-12 h-12 text-primary drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                </div>

                <div className="space-y-4">
                    <h1 className="text-6xl font-black tracking-tighter uppercase leading-none italic">
                        Nuestros <span className="text-primary">Cortes</span>
                    </h1>
                    <p className="text-gray-400 text-xl font-medium">
                        Estás a un paso de la mejor experiencia parrillera de tu vida.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-6">
                    <Link href="/">
                        <Button size="lg" className="w-full bg-primary hover:bg-white hover:text-black transition-all duration-500 font-black text-xl h-16 rounded-none group">
                            VER CATÁLOGO COMPLETO
                            <Sparkles className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
                        </Button>
                    </Link>

                    <Link href="/#featured">
                        <Button size="lg" variant="outline" className="w-full border-white/20 hover:bg-white/10 h-16 font-bold tracking-widest uppercase">
                            Ofertas de la Semana
                        </Button>
                    </Link>
                </div>

                <p className="text-xs text-gray-500 uppercase tracking-[0.3em] font-medium pt-8">
                    Pasión por el Fuego • Respeto por el Origen
                </p>
            </div>
        </div>
    );
}
