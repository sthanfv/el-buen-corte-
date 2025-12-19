'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Flame, Star, Loader2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import ExperienceRequestForm from '@/components/experiences/ExperienceRequestForm';
import ExperienceCommentForm from '@/components/experiences/ExperienceCommentForm';
import ExperienceCommentsSection from '@/components/experiences/ExperienceCommentsSection';
import LegalWarningOverlay from '@/components/experiences/LegalWarningOverlay';

export default function BlogPage() {
    const [status, setStatus] = useState<'none' | 'pending' | 'approved' | 'rejected' | 'loading'>('loading');

    const checkStatus = async () => {
        try {
            const res = await fetch('/api/experiences/status');
            if (res.ok) {
                const data = await res.json();
                setStatus(data.status);
            }
        } catch (error) {
            console.error('Error checking status', error);
        }
    };

    useEffect(() => {
        checkStatus();
    }, []);

    const renderHeader = () => (
        <div className="relative h-[40vh] flex items-center justify-center overflow-hidden border-b border-white/10 uppercase italic">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
            <Image
                src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1600&auto=format&fit=crop"
                alt="Grill background"
                fill
                className="object-cover opacity-50 contrast-125"
            />
            <div className="relative z-20 text-center space-y-4 px-4">
                <Flame className="w-12 h-12 text-primary mx-auto animate-pulse" />
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none italic">
                    EXPERI<span className="text-primary italic">ENCIAS</span>
                </h1>
                <p className="text-gray-400 tracking-[0.5em] text-xs font-bold font-mono">COMUNIDAD & FEEDBACK PREMIUM</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-primary selection:text-white pb-32">
            <LegalWarningOverlay />
            {renderHeader()}

            <div className="max-w-6xl mx-auto px-6 py-20 space-y-24">
                <div className="flex items-center justify-between border-b border-white/5 pb-8">
                    <h2 className="text-3xl font-black italic">EL BUEN CORTE COMMUNITY</h2>
                    <Link href="/">
                        <Button variant="ghost" className="text-gray-400 hover:text-white gap-2 border border-white/10 italic font-black text-xs">
                            <ArrowLeft size={16} /> VOLVER A TIENDA
                        </Button>
                    </Link>
                </div>

                {/* DYNAMIC FORM SECTION */}
                <section className="max-w-3xl mx-auto">
                    {status === 'loading' && (
                        <div className="flex justify-center py-10">
                            <Loader2 className="animate-spin text-primary w-8 h-8" />
                        </div>
                    )}

                    {(status === 'none' || status === 'rejected') && (
                        <ExperienceRequestForm onSuccess={checkStatus} />
                    )}

                    {status === 'pending' && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-8 rounded-lg text-center space-y-4">
                            <ShieldAlert className="w-12 h-12 text-yellow-500 mx-auto" />
                            <h3 className="text-2xl font-black italic">SOLICITUD EN REVISIÓN</h3>
                            <p className="text-gray-440 italic">
                                Tu IP está siendo validada por nuestro equipo técnico.
                                En breve podrás compartir tu experiencia con nosotros.
                            </p>
                        </div>
                    )}

                    {status === 'approved' && (
                        <ExperienceCommentForm onSuccess={() => { }} />
                    )}
                </section>

                {/* COMMENTS LIST */}
                <ExperienceCommentsSection />

                {/* BRAND VALUE */}
                <div className="bg-zinc-900/50 p-12 rounded-xl border border-white/5 text-center space-y-6">
                    <Star className="w-10 h-10 text-primary mx-auto" />
                    <h3 className="text-4xl font-black italic uppercase">CALIDAD SIN COMPROMISO</h3>
                    <p className="max-w-2xl mx-auto text-gray-400 italic font-medium leading-relaxed">
                        En El Buen Corte, cada comentario nos ayuda a perfeccionar la cadena de frío, la selección de cortes y la logística de entrega.
                        Gracias por ser parte de la élite parrillera.
                    </p>
                </div>
            </div>
        </div>
    );
}
