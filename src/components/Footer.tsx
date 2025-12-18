'use client';
import {
  Instagram,
  Facebook,
  Twitter,
  ChefHat,
  MapPin,
  Phone,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { useConfig } from '@/lib/config';

export default function Footer() {
  const { config, loading } = useConfig();

  if (loading) {
    return (
      <footer className="bg-secondary/20 text-white pt-10 pb-10 border-t border-white/5 text-center">
        <Loader2 className="animate-spin h-6 w-6 mx-auto text-primary" />
      </footer>
    );
  }

  // Fallback seguro si config es null por alguna razón rara
  const data = config || {
    contactPhone: '+57 (300) 123-4567',
    contactAddress: 'Cra 12 # 93 - 15, Bogotá',
    contactEmail: 'contacto@buencorte.co',
    footerText:
      'Redefiniendo la experiencia carnívora en Colombia. Pasión por el fuego, respeto por el producto.',
    instagramUrl: '',
    facebookUrl: '',
    twitterUrl: '',
  };

  return (
    <footer className="bg-secondary/20 text-white pt-20 pb-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <ChefHat className="text-primary w-8 h-8" />
            <span className="text-2xl font-black tracking-tighter">
              Buen<span className="text-primary">Corte</span>
            </span>
          </div>
          <p className="text-muted-foreground max-w-sm mb-6">
            {data.footerText}
          </p>
          <div className="flex gap-4">
            {data.instagramUrl && (
              <Link href={data.instagramUrl} target="_blank">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/5 hover:bg-primary text-white border-white/10 hover:border-primary"
                >
                  <Instagram size={18} />
                </Button>
              </Link>
            )}
            {data.facebookUrl && (
              <Link href={data.facebookUrl} target="_blank">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/5 hover:bg-blue-600 text-white border-white/10 hover:border-blue-600"
                >
                  <Facebook size={18} />
                </Button>
              </Link>
            )}
            {data.twitterUrl && (
              <Link href={data.twitterUrl} target="_blank">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/5 hover:bg-sky-500 text-white border-white/10 hover:border-sky-500"
                >
                  <Twitter size={18} />
                </Button>
              </Link>
            )}
          </div>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-6 text-foreground">Navegación</h4>
          <ul className="space-y-3">
            <li>
              <Link href="/catalog" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                <span className="w-1.5 h-1.5 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform"></span>
                Catálogo
              </Link>
            </li>
            <li>
              <Link href="/catalog" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                <span className="w-1.5 h-1.5 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform"></span>
                Nuestro Catálogo
              </Link>
            </li>
            <li>
              <Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                <span className="w-1.5 h-1.5 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform"></span>
                Blog & Experiencias
              </Link>
            </li>
            <li>
              <span className="text-gray-600 flex items-center gap-2 cursor-not-allowed select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                Club (Próximamente)
              </span>
            </li>
            <li>
              <Link
                href="/admin/products/new"
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform"></span>
                Admin Panel
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-6 text-foreground">Contacto</h4>
          <ul className="space-y-4 text-muted-foreground text-sm">
            <li className="flex gap-3">
              <MapPin size={18} className="text-primary mt-0.5" />
              {data.contactAddress}
            </li>
            <li className="flex gap-3">
              <Phone size={18} className="text-primary mt-0.5" />
              {data.contactPhone}
            </li>
            <li className="flex gap-3">
              <ShieldCheck size={18} className="text-green-500 mt-0.5" /> Pagos
              Seguros
            </li>
          </ul>
        </div>
        <div className="md:col-span-1"> {/* Adjusted col-span to fit the new layout */}
          <h4 className="font-bold text-lg mb-6 text-foreground">Legal</h4>
          <ul className="space-y-3">
            <li>
              <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                <span className="w-1.5 h-1.5 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform"></span>
                Política de Privacidad
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                <span className="w-1.5 h-1.5 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform"></span>
                Términos del Servicio
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-medium">
        <p>© {new Date().getFullYear()} BuenCorte S.A.S. Todos los derechos reservados.</p>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacidad
          </Link>
          <Link href="/terms" className="hover:text-white transition-colors">
            Términos
          </Link>
        </div>
      </div>
    </footer>
  );
}
