'use client';
import Image from 'next/image';
import { ArrowRight, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import placeholderImages from '@/lib/placeholder-images.json';

export default function Hero() {
  const handleScroll = () => {
    const element = document.getElementById('catalogo');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative h-[500px] flex items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 opacity-40">
        <Image
          src={placeholderImages.hero[0].src}
          alt={placeholderImages.hero[0].alt}
          fill
          className="object-cover"
          priority
          data-ai-hint={placeholderImages.hero[0].aiHint}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/60"></div>

      <div className="relative z-10 text-center max-w-3xl px-6 mt-10">
        <Badge
          variant="destructive"
          className="bg-primary/20 border border-primary/50 backdrop-blur-md text-red-100 text-xs font-bold uppercase tracking-widest mb-6 animate-fade-slide"
        >
          <Flame size={12} className="text-primary mr-2" /> Cortes Premium
          Seleccionados
        </Badge>
        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-none animate-fade-slide [text-shadow:0_2px_10px_rgba(0,0,0,0.5)]">
          El Arte de la <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">
            Carne Perfecta
          </span>
        </h1>
        <p className="text-gray-300 text-lg md:text-xl font-medium mb-8 max-w-2xl mx-auto animate-fade-slide [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]">
          Llevamos la experiencia del mejor steakhouse directamente a tu
          parrilla. Maduración dry-aged, trazabilidad y cortes de autor.
        </p>
        <Button
          onClick={handleScroll}
          size="lg"
          className="px-8 py-4 bg-white text-black rounded-full font-bold text-sm uppercase tracking-widest hover:bg-gray-200 transition-all transform hover:scale-105 shadow-xl flex items-center gap-2 mx-auto animate-fade-slide"
        >
          Explorar Colección <ArrowRight size={16} />
        </Button>
      </div>
    </section>
  );
}
