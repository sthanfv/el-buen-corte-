'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Fuse from 'fuse.js';
import { Product } from '@/types/products';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/data/products';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface FuzzySearchBarProps {
  products: Product[];
  onSearch?: (term: string) => void;
}

/**
 * FuzzySearchBar (MANDATO-FILTRO: Nivel UX/AI)
 * Implementa búsqueda semántica con resultados flotantes y tolerancia a errores.
 */
export default function FuzzySearchBar({
  products,
  onSearch,
}: FuzzySearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Configuración del Algoritmo Fuse.js (MANDATO-FILTRO)
  const fuse = useMemo(
    () =>
      new Fuse(products, {
        keys: [
          { name: 'name', weight: 0.8 },
          { name: 'category', weight: 0.4 },
          { name: 'tags', weight: 0.6 },
          { name: 'badge', weight: 0.2 },
        ],
        threshold: 0.35, // Balance entre precisión y error ortográfico
        distance: 100,
        minMatchCharLength: 2,
        includeScore: true,
      }),
    [products]
  );

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query).slice(0, 5); // Mostramos top 5 para limpieza visual
  }, [query, fuse]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectProduct = (productId: string) => {
    setIsOpen(false);
    setQuery('');
    // Desplazamiento suave al producto o sección
    const element = document.getElementById(`product-${productId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleChange = (val: string) => {
    setQuery(val);
    setIsOpen(true);
    if (onSearch) onSearch(val);
  };

  return (
    <div ref={containerRef} className="relative w-full group">
      <div className="relative">
        <Search
          className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2 transition-colors',
            isOpen ? 'text-primary' : 'text-muted-foreground'
          )}
          size={18}
        />
        <Input
          type="text"
          placeholder="¿Qué se te antoja hoy? (ej: asado blando)"
          className="w-full pl-10 pr-10 py-2.5 bg-gray-100 border-transparent border-2 rounded-xl focus:bg-white focus:border-primary focus:outline-none transition-all font-medium text-sm dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-white"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => handleChange(e.target.value)}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              onSearch?.('');
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-black dark:text-gray-400 dark:hover:text-white"
            aria-label="Limpiar búsqueda"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Resultados Flotantes (MANDATO-FILTRO) */}
      {isOpen && query && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {results.length > 0 ? (
            <div className="p-2">
              <p className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                Sugerencias del Maestro Carnicero
              </p>
              {results.map(({ item }) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectProduct(item.id)}
                  className="w-full text-left p-3 hover:bg-primary/5 dark:hover:bg-primary/10 rounded-xl flex items-center justify-between transition-colors group/item"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover/item:text-primary transition-colors">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase font-medium">
                      {item.category} {item.badge && `• ${item.badge}`}
                    </span>
                  </div>
                  <span className="font-black italic text-sm text-primary">
                    {formatPrice(item.pricePerKg)}/Kg
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center space-y-2">
              <p className="text-sm font-bold opacity-60 italic">
                No encontramos ese corte exacto...
              </p>
              <p className="text-[10px] uppercase font-black text-primary">
                ¡Intenta con &quot;Res&quot;, &quot;Cerdo&quot; o
                &quot;Premium&quot;!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
