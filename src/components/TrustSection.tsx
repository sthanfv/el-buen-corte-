'use client';
import { ShieldCheck, Thermometer, ChefHat } from 'lucide-react';

export default function TrustSection() {
  return (
    <section className="bg-secondary/20 text-white py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {/* Calidad Certificada */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur text-primary">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Calidad Certificada</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Todos nuestros cortes cuentan con trazabilidad completa y
              certificaciones sanitarias al día.
            </p>
          </div>

          {/* Cadena de Frío */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur text-primary">
              <Thermometer size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Cadena de Frío</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Empacado al vacío y transporte refrigerado inteligente para
              garantizar frescura absoluta.
            </p>
          </div>

          {/* Asesoría de Chefs */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur text-primary">
              <ChefHat size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Asesoría de Chefs</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Incluimos guías de preparación y maridaje con cada compra para que
              brilles en la parrilla.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
