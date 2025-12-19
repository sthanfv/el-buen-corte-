'use client';

import { ShoppingBag, Search, ChefHat, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import FuzzySearchBar from './FuzzySearchBar';
import { Product } from '@/types/products';
import { useEffect, useState } from 'react';

interface HeaderProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  cartCount: number;
  onCartClick: () => void;
}

import { ModeToggle } from '@/components/ModeToggle';

interface HeaderProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  cartCount: number;
  onCartClick: () => void;
}

export default function Header({
  searchTerm,
  onSearchTermChange,
  cartCount,
  onCartClick,
}: HeaderProps) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products/list');
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (err) {
        // Silencioso, el search bar manejará el estado vacío
      }
    }
    fetchProducts();
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md dark:bg-zinc-950/80 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu size={24} />
            <span className="sr-only">Abrir menú</span>
          </Button>
          <div className="flex items-center gap-2">
            <ChefHat className="text-primary w-8 h-8" />
            <span className="text-2xl font-black tracking-tighter hidden md:block dark:text-white">
              Buen<span className="text-primary">Corte</span>
            </span>
          </div>
        </div>

        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <FuzzySearchBar
            products={products}
            onSearch={onSearchTermChange}
          />
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button
            variant="ghost"
            onClick={onCartClick}
            className="relative p-3 rounded-xl transition-colors group"
          >
            <ShoppingBag
              size={24}
              className="text-gray-700 group-hover:text-black dark:text-gray-200 dark:group-hover:text-white"
            />
            {cartCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute top-2 right-2 w-4 h-4 justify-center p-0 animate-bounce bg-primary"
              >
                {cartCount}
              </Badge>
            )}
            <span className="sr-only">Abrir carrito, {cartCount} items</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
