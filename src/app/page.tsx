'use client';

import { useState, useMemo, useEffect } from 'react';
import Fuse from 'fuse.js';
import { Product, OrderItem } from '@/types/products';
import MeatProductCard from '@/components/MeatProductCard';
import OrderSidebar from '@/components/CartSidebar';
import { useCart } from '@/components/cart-provider';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import TrustSection from '@/components/TrustSection';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import FilterButtons from '@/components/FilterButtons';
import { ProductSkeleton } from '@/components/ProductSkeleton';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { auth } from '@/firebase/client';
import ErrorBoundary from '@/components/ErrorBoundary';
import { PRODUCT_TAGS } from '@/data/products';

export default function Home() {
  /* 
    Modificación: Conexión a Base de Datos Real 
    ---------------------------------------------
    Antes leíamos PRODUCTS_DB de un archivo estático.
    Ahora usamos un useEffect para pedir los datos a nuestra API.
  */
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleItems, setVisibleItems] = useState(9); // Inicialmente mostrar 9 productos

  // Global Cart State
  const { order, addToCart, removeFromCart: removeContext, isCartOpen, setIsCartOpen } = useCart();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const { toast } = useToast();

  // Hook: Carga de productos desde base de datos (Firestore)
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products/list');
        if (!response.ok) throw new Error('Error cargando productos');
        const data: Product[] = await response.json();

        // ✅ ENRIQUECIMIENTO SEMÁNTICO (MANDATO-FILTRO)
        // Inyectamos tags tácticos para potenciar el Fuzzy Search
        const enrichedProducts = data.map(p => {
          const lowerName = p.name.toLowerCase();
          let tags: string[] = [];
          if (lowerName.includes('tomahawk')) tags = PRODUCT_TAGS.tomahawk;
          else if (lowerName.includes('puyazo') || lowerName.includes('pica')) tags = PRODUCT_TAGS.puyazo;
          else if (lowerName.includes('lomo') || lowerName.includes('baby')) tags = PRODUCT_TAGS.lomito;
          else if (lowerName.includes('costilla')) tags = PRODUCT_TAGS.costilla;
          else if (lowerName.includes('chorizo')) tags = PRODUCT_TAGS.chorizo;

          return { ...p, tags: [...(p.tags || []), ...tags] };
        });

        setProducts(enrichedProducts);
      } catch (error) {
        toast({ type: 'error', message: 'No se pudo cargar el catálogo.' });
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [toast]);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (activeCategory !== 'Todos') {
      filtered = filtered.filter((p) => p.category === activeCategory);
    }

    if (searchTerm) {
      // ✅ FUZZY SEARCH (MANDATO-FILTRO): Búsqueda semántica con tolerancia a errores
      const fuse = new Fuse(filtered, {
        keys: [
          { name: 'name', weight: 0.7 },
          { name: 'category', weight: 0.3 },
          { name: 'tags', weight: 0.5 },
          { name: 'badge', weight: 0.2 }
        ],
        threshold: 0.4, // Tolerancia al error ortográfico
        includeScore: true,
      });

      const results = fuse.search(searchTerm);
      filtered = results.map(r => r.item);
    }

    return filtered;
  }, [products, searchTerm, activeCategory]);

  const addToOrder = (item: Product & { selectedWeight: number; finalPrice: number }) => {
    const newItem: OrderItem = { ...item, orderId: Date.now().toString() };
    addToCart(newItem); // Use Global Action
    toast({
      type: 'success',
      title: 'Producto Añadido',
      message: `${item.name} (${item.selectedWeight}kg) se añadió a tu pedido.`,
    });
  };

  const removeFromOrder = (id: string) => {
    // Current Context uses index, but Sidebar uses ID. 
    // Need to find index or update Context to remove by ID.
    // For now, let's find index by orderId
    const index = order.findIndex((item) => item.orderId === id);
    if (index !== -1) {
      removeContext(index);
      toast({
        type: 'error',
        title: 'Producto Eliminado',
        message: 'El producto ha sido eliminado de tu pedido.',
      });
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <>
      <Header
        searchTerm={searchTerm}
        onSearchTermChange={handleSearch}
        cartCount={order.length}
        onCartClick={() => setIsCartOpen(true)}
      />
      <Hero />
      <main id="catalogo" className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-2">
              Nuestra Selección
            </h2>
            <p className="text-gray-500">
              Cortes disponibles para entrega inmediata (Envíos refrigerados)
            </p>
          </div>
          <FilterButtons
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
        </div>

        <section>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 md:gap-8">
              {Array.from({ length: 9 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-gray-300 dark:border-white/10">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                No encontramos resultados
              </h3>
              <p className="text-gray-500">
                Intenta buscar con otros términos o cambia de categoría.
              </p>
            </div>
          ) : (
            <>
              {/* Product Grid con Protección de Resiliencia */}
              <ErrorBoundary fallbackTitle="Error en Vitrina de Productos">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 md:gap-8">
                  {filteredProducts.slice(0, visibleItems).map((product) => (
                    <MeatProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToOrder}
                    />
                  ))}
                </div>
              </ErrorBoundary>

              {visibleItems < filteredProducts.length && (
                <div className="flex justify-center mt-12 pb-10">
                  <Button
                    onClick={() => setVisibleItems(prev => prev + 9)}
                    variant="outline"
                    className="group border-primary text-primary hover:bg-primary hover:text-white px-10 h-14 font-black italic uppercase rounded-none transition-all duration-300"
                  >
                    DESCUBRIR MÁS CORTES
                    <ChevronDown className="ml-2 w-5 h-5 group-hover:translate-y-1 transition-transform" />
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <TrustSection />
      <Footer />
      <OrderSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
}
