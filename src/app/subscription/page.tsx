import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SubscriptionPage() {
    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 flex flex-col items-center justify-center text-center">
            <Crown className="w-20 h-20 text-yellow-500 mb-6 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
            <h1 className="text-5xl font-black mb-4 uppercase tracking-tighter">Club de Suscripción</h1>
            <p className="text-gray-400 text-xl max-w-md mb-8">
                Beneficios exclusivos, entregas programadas y cortes de edición limitada para miembros VIP. Estamos trabajando en ello.
            </p>
            <Link href="/">
                <Button size="lg" className="bg-yellow-600 hover:bg-yellow-700 text-white gap-2">
                    <ArrowLeft size={18} /> Volver a la Tienda
                </Button>
            </Link>
        </div>
    );
}
