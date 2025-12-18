'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Cookie, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Verificar si ya aceptó
        const consent = localStorage.getItem('bc_cookie_consent');
        if (!consent) {
            // Mostrar después de 2 segundos para no ser invasivo de inmediato
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const accept = () => {
        localStorage.setItem('bc_cookie_consent', 'true');
        setIsVisible(false);
        // Aquí se podrían inicializar scripts de Analytics
        window.location.reload(); // Recargar para aplicar cambios si fuera necesario
    };

    const decline = () => {
        localStorage.setItem('bc_cookie_consent', 'false');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
                >
                    <div className="max-w-4xl mx-auto bg-black/90 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-6">
                        <div className="bg-primary/20 p-3 rounded-full hidden md:block">
                            <Cookie className="text-primary w-8 h-8" />
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-white font-bold mb-1">Tu privacidad nos importa</h3>
                            <p className="text-gray-400 text-sm">
                                Usamos cookies para mejorar tu experiencia de compra y analizar el tráfico.
                                Al continuar, aceptas nuestra política de privacidad.
                            </p>
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            <Button
                                variant="outline"
                                className="flex-1 md:flex-none border-white/20 text-white hover:bg-white/10"
                                onClick={decline}
                            >
                                Solo funcionales
                            </Button>
                            <Button
                                className="flex-1 md:flex-none bg-primary hover:bg-primary/90 text-white"
                                onClick={accept}
                            >
                                Aceptar todas
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
