'use client';
import {
  Instagram,
  Facebook,
  Twitter,
  ChefHat,
  MapPin,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';

export default function Footer() {
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
            Redefiniendo la experiencia carnívora en Colombia. Pasión por el
            fuego, respeto por el producto.
          </p>
          <div className="flex gap-4">
            <Button
              variant="outline"
              size="icon"
              className="bg-white/5 hover:bg-primary text-white border-white/10 hover:border-primary"
            >
              <Instagram size={18} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="bg-white/5 hover:bg-blue-600 text-white border-white/10 hover:border-blue-600"
            >
              <Facebook size={18} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="bg-white/5 hover:bg-sky-500 text-white border-white/10 hover:border-sky-500"
            >
              <Twitter size={18} />
            </Button>
          </div>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-6 text-foreground">Navegación</h4>
          <ul className="space-y-3 text-muted-foreground text-sm">
            <li>
              <a href="#" className="hover:text-primary transition-colors">
                Catálogo
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary transition-colors">
                Experiencias
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary transition-colors">
                Blog Parrillero
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary transition-colors">
                Club de Suscripción
              </a>
            </li>
            <li>
              <Link
                href="/admin/products/new"
                className="hover:text-primary transition-colors"
              >
                Admin Panel
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-6 text-foreground">Contacto</h4>
          <ul className="space-y-4 text-muted-foreground text-sm">
            <li className="flex gap-3">
              <MapPin size={18} className="text-primary mt-0.5" /> Cra 12 # 93 -
              15, Bogotá
            </li>
            <li className="flex gap-3">
              <Phone size={18} className="text-primary mt-0.5" /> +57 (300)
              123-4567
            </li>
            <li className="flex gap-3">
              <ShieldCheck size={18} className="text-green-500 mt-0.5" /> Pagos
              Seguros
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-medium">
        <p>© 2024 BuenCorte S.A.S. Todos los derechos reservados.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">
            Política de Privacidad
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Términos del Servicio
          </a>
        </div>
      </div>
    </footer>
  );
}
