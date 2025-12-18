import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, Server, UserCheck, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
    title: 'Política de Privacidad | El Buen Corte',
    description: 'Tratamiento de datos personales y compromiso de seguridad de El Buen Corte.',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black text-white font-serif selection:bg-primary selection:text-white">
            {/* Header Bar */}
            <div className="border-b border-white/10 bg-secondary/10 sticky top-0 z-50 backdrop-blur-md">
                <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/">
                        <Button variant="ghost" className="text-gray-400 hover:text-white gap-2 font-mono text-xs tracking-widest uppercase">
                            <ArrowLeft size={14} /> TIENDA
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2 group">
                        <Lock className="w-4 h-4 text-primary" />
                        <span className="font-black tracking-tighter uppercase text-sm italic">Cyber <span className="text-primary italic">Shield</span></span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-20 space-y-16">
                <header className="space-y-6 border-l-4 border-primary pl-10 py-4">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.9]">
                        Tratamiento <br /><span className="text-primary italic">de</span> Datos
                    </h1>
                    <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.4em] font-bold">
                        Data Privacy Standards v1.8 - Bogotá
                    </p>
                </header>

                <div className="space-y-12 text-gray-400 leading-relaxed text-lg italic">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3 not-italic">
                            <Eye className="text-primary w-6 h-6" /> 01 / Recolección de Información
                        </h2>
                        <p>
                            En el ejercicio de su actividad comercial, <strong>El Buen Corte S.A.S.</strong> recolecta exclusivamente los datos necesarios para garantizar la excelencia logística: nombres, direcciones de geolocalización, números de contacto para coordinación de cadena de frío y direcciones de correo electrónico para facturación electrónica.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3 not-italic">
                            <Server className="text-primary w-6 h-6" /> 02 / Seguridad y Almacenamiento
                        </h2>
                        <p>
                            Utilizamos infraestructuras de nivel bancario (AES-256) para el resguardo de información. Los datos transaccionales son procesados bajo protocolos cifrados TLS/SSL. No almacenamos credenciales de tarjetas de crédito directamente; utilizamos pasarelas de pago certificadas PCI-DSS.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3 not-italic">
                            <UserCheck className="text-primary w-6 h-6" /> 03 / Derechos Habeas Data
                        </h2>
                        <p>
                            Usted ostenta el derecho inalienable a consultar, rectificar o solicitar la supresión técnica de sus datos personales de nuestras bases de datos en cumplimiento con la Ley 1581 de 2012.
                        </p>
                    </section>

                    <section className="bg-primary/5 p-8 border border-primary/20 rounded-none">
                        <h3 className="text-white font-black mb-4 flex items-center gap-2 not-italic">
                            <Mail className="w-5 h-5" /> CANAL OFICIAL DE PRIVACIDAD
                        </h3>
                        <p className="text-sm">
                            Para cualquier requerimiento legal o técnico sobre su información, contacte directamente a nuestra oficina de cumplimiento: <br />
                            <span className="text-white font-bold font-mono">legal@buencorte.co</span>
                        </p>
                    </section>

                    <div className="pt-20 border-t border-white/5 text-center">
                        <Link href="/">
                            <Button className="bg-white text-black font-black italic rounded-none h-12 px-8 uppercase hover:bg-primary hover:text-white transition-all">
                                ENTENDIDO Y DE ACUERDO
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
