import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Gavel, ShieldCheck, Scale, AlertCircle, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
    title: 'Términos y Condiciones | El Buen Corte',
    description: 'Acuerdos legales fundamentales para la relación comercial con El Buen Corte.',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black text-white font-serif selection:bg-primary selection:text-white">
            {/* Professional Header Area */}
            <div className="border-b border-white/10 bg-secondary/10 sticky top-0 z-50 backdrop-blur-md">
                <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/">
                        <Button variant="ghost" className="text-gray-400 hover:text-white gap-2 font-mono text-xs tracking-widest uppercase">
                            <ArrowLeft size={14} /> TIENDA
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2 group">
                        <Gavel className="w-5 h-5 text-primary group-hover:rotate-12 transition-transform" />
                        <span className="font-black tracking-tighter uppercase text-sm italic">Legal Framework <span className="text-primary italic">2025</span></span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-20 space-y-16">
                <header className="space-y-6 border-l-4 border-primary pl-10 py-4 animate-in fade-in slide-in-from-left-4 duration-1000">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.9]">
                        Términos <br /><span className="text-primary italic">&</span> Condiciones
                    </h1>
                    <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.4em] font-bold">
                        Versión Corporativa 4.2 - Enero 2025
                    </p>
                </header>

                <div className="space-y-12 text-gray-400 leading-relaxed text-lg">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3 italic">
                            <Scale className="text-primary w-6 h-6" /> 01 / Preámbulo Legal
                        </h2>
                        <p>
                            El acceso, uso y navegación por el portal de <strong>El Buen Corte S.A.S.</strong> comporta la aceptación plena y sin reservas de todas y cada una de las condiciones generales aquí expuestas. Si usted no está de acuerdo con estas cláusulas, deberá abstenerse de utilizar el sitio y de adquirir cualquier producto comercializado por esta entidad.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3 italic">
                            <ShoppingBag className="text-primary w-6 h-6" /> 02 / Naturaleza de los Productos
                        </h2>
                        <p>
                            Nuestra gama de productos carnicos premium ostenta la categoría de &quot;Bienes Perecederos&quot;. Por su naturaleza biológica, frescura y sensibilidad térmica:
                        </p>
                        <ul className="list-none space-y-3 pl-4 border-l border-white/10">
                            <li className="flex gap-4">
                                <span className="text-primary font-black">/</span>
                                <span><strong>Pesos y Gramajes:</strong> Dado el origen artesanal y manual del corte, se admite una desviación de +/- 5% sobre el peso nominal solicitado, la cual será ajustada en la facturación final.</span>
                            </li>
                            <li className="flex gap-4">
                                <span className="text-primary font-black">/</span>
                                <span><strong>Cadena de Frío:</strong> El compromiso de El Buen Corte cesa tras la entrega efectiva en el domicilio indicado. Es responsabilidad del consumidor garantizar la refrigeración inmediata (0°C a 4°C).</span>
                            </li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3 italic">
                            <ShieldCheck className="text-primary w-6 h-6" /> 03 / Propiedad Intelectual
                        </h2>
                        <p>
                            Todo el contenido presente en esta plataforma (textos, fotografías de productos, logotipos, diagramas y arquitectura web) es propiedad exclusiva de <strong>El Buen Corte S.A.S.</strong>. Queda terminantemente prohibida cualquier reproducción total o parcial con fines comerciales sin autorización expresa y notariada.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3 italic">
                            <AlertCircle className="text-primary w-6 h-6" /> 04 / Limitación de Responsabilidad
                        </h2>
                        <p>
                            El Buen Corte no se hace responsable por malestares derivados de una cocción inadecuada por parte del cliente, ni por reacciones alérgicas no notificadas formalmente en el momento de la órden. Recomendamos seguir estrictamente nuestras guías de temperatura interna.
                        </p>
                    </section>

                    <div className="pt-20 border-t border-white/5 text-center">
                        <p className="text-xs font-mono uppercase tracking-widest text-gray-600">
                            © 2025 EL BUEN CORTE S.A.S. - BOGOTÁ, COLOMBIA
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
