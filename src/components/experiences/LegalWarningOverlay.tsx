'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShieldAlert, AlertCircle, XOctagon } from 'lucide-react';

export default function LegalWarningOverlay() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const accepted = localStorage.getItem('experiences_legal_accepted');
        if (!accepted) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('experiences_legal_accepted', 'true');
        setIsVisible(false);
        document.body.style.overflow = 'auto';
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 text-white text-center selection:bg-primary selection:text-white">
            <div className="max-w-2xl space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="flex justify-center">
                    <div className="relative">
                        <ShieldAlert className="w-24 h-24 text-primary animate-pulse" />
                        <XOctagon className="w-10 h-10 text-red-600 absolute -bottom-2 -right-2 animate-bounce" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter leading-none italic uppercase">
                        AVISO DE <span className="text-primary italic text-red-600">SEGURIDAD</span>
                    </h2>
                    <p className="text-gray-400 tracking-[0.3em] text-xs font-bold font-mono">ESTÁS ENTRANDO EN UNA ZONA MONITOREADA</p>
                </div>

                <div className="bg-red-950/20 border-2 border-red-500/30 p-8 rounded-2xl space-y-6 text-left relative overflow-hidden">
                    <div className="flex items-start gap-4">
                        <AlertCircle className="text-red-500 w-8 h-8 shrink-0 mt-1" />
                        <p className="text-sm md:text-md italic font-medium text-gray-200 leading-relaxed uppercase">
                            Esta sección es para uso exclusivo de clientes y entusiastas de la parrilla.
                            Cualquier intento de <span className="text-red-500 font-black">SPAM, LENGUAJE OFENSIVO, O PUBLICIDAD</span> resultará en el:
                        </p>
                    </div>

                    <ul className="space-y-3 pl-12 text-xs font-black tracking-widest uppercase italic text-red-500">
                        <li>• BLOQUEO INMEDIATO DE TU CONEXIÓN</li>
                        <li>• ELIMINACIÓN DE TODO TU CONTENIDO</li>
                        <li>• ACCIONES LEGALES SI SE DETECTA INTENTO DE FRAUDE</li>
                    </ul>

                    <p className="text-[10px] text-gray-500 italic text-center border-t border-white/5 pt-4">
                        Al continuar, aceptas que tu dispositivo sea registrado para fines de seguridad y moderación.
                    </p>
                </div>

                <Button
                    onClick={handleAccept}
                    className="w-full h-16 bg-red-600 hover:bg-white hover:text-red-600 font-black italic tracking-widest text-lg transition-all duration-500 border-2 border-red-600"
                >
                    ENTIENDO LAS REPERCUSIONES Y DESEO CONTINUAR
                </Button>
            </div>
        </div>
    );
}
