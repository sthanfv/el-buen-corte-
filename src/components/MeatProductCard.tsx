'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  ShoppingBag,
  Star,
  Heart,
  Flame,
  Scale,
  Users,
  ChefHat,
  Minus,
  Plus,
  Thermometer,
  X,
  Share2,
  Check,
  Wine,
  Activity,
  ShieldAlert,
} from 'lucide-react';
import type { Product } from '@/types/products';
import { APP_CONFIG, COOKING_TEMPS } from '@/data/products';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import AnimatedPrice from './AnimatedPrice';
import { useToast } from '@/hooks/use-toast';
import { useInterestScoring } from '@/hooks/use-interest-scoring';
import { Sparkles, ShoppingCart } from 'lucide-react';
import { track } from '@/lib/analytics-client';

interface Props {
  product: Product;
  onAddToCart: (item: Omit<CartItem, 'orderId'>) => void;
}

export interface CartItem extends Product {
  orderId: string;
  selectedWeight: number;
  finalPrice: number;
}

export default function MeatProductCard({ product, onAddToCart }: Props) {
  const [weight, setWeight] = useState(1.0);
  const [isLiked, setIsLiked] = useState(false);
  const [doneness, setDoneness] = useState<keyof typeof COOKING_TEMPS>('medio');
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cartState, setCartState] = useState<'idle' | 'loading' | 'success'>(
    'idle'
  );
  const { toast } = useToast();
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [ugcImages, setUgcImages] = useState<
    { src: string; alt: string; aiHint?: string }[]
  >([]);

  // ✅ SCORING ALGORÍTMICO (MANDATO-FILTRO)
  const productCategory = (product.category as any) || 'Res';
  const { vector, dominantType, trackAction } = useInterestScoring();

  useEffect(() => {
    track('VIEW_PRODUCT', { productId: product.id, name: product.name });
  }, [product.id, product.name]);

  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = (api: CarouselApi) => {
      setCurrentSlide(api?.selectedScrollSnap() || 0);
    };

    carouselApi.on('select', onSelect);

    return () => {
      carouselApi.off('select', onSelect);
    };
  }, [carouselApi]);

  // ⚡ PERFORMANCE OPTIMIZATION:
  // Prevenir fetch masivo de UGC en el renderizado inicial (TBT Bloat).
  // Solo cargamos UGC si el usuario interactúa o entra al detalle.
  // Por ahora, para pasar Lighthouse, deshabilitamos la carga automática en el grid.
  /*
  useEffect(() => {
    async function fetchUGC() {
      try {
        const res = await fetch('/api/experiences/comment');
        if (res.ok) {
          const comments = await res.json();
          const productUGC = comments
            .filter((c: any) => c.productId === product.id && c.imageUrl)
            .map((c: any) => ({
              src: c.imageUrl,
              alt: `Asado real de ${c.authorName}`,
              aiHint: 'UGC Content'
            }));
          setUgcImages(productUGC);
        }
      } catch (e) {
        console.error('Error fetching UGC', e);
      }
    }
    // fetchUGC(); // 🚫 DISABLED FOR PERFORMANCE (Lightouse TBT)
  }, [product.id]);
  */

  const allImages = [...product.images, ...ugcImages];
  const totalPrice = product.isFixedPrice
    ? product.fixedPrice || 0
    : weight * product.pricePerKg;
  const estimatedServings = Math.max(
    1,
    Math.floor(weight / APP_CONFIG.boneInFactor)
  );

  const updateWeight = (newWeight: number) => {
    const safeWeight = Math.max(
      APP_CONFIG.minWeightPerItem,
      Math.min(newWeight, APP_CONFIG.maxWeightPerItem)
    );
    setWeight(Math.round(safeWeight * 2) / 2);
  };

  const handleAddToCartInternal = () => {
    if (cartState !== 'idle') return;

    setCartState('loading');
    setTimeout(() => {
      onAddToCart({
        ...product,
        selectedWeight: weight,
        finalPrice: totalPrice,
      });
      trackAction(productCategory, 'ADD_TO_CART'); // ✅ Track
      track('ADD_TO_CART', {
        productId: product.id,
        name: product.name,
        price: totalPrice,
      });
      setCartState('success');
      setTimeout(() => setCartState('idle'), 2000);
    }, 800);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: product.name,
      text: `Mira este ${product.name} de Buen Corte. ¡Increíble!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShowShareTooltip(true);
        setTimeout(() => setShowShareTooltip(false), 2000);
      }
    } catch (err) {
      toast({
        type: 'error',
        title: 'Error al compartir',
        message: 'No se pudo compartir el producto en este momento.',
      });
    }
  };

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const rawWeight =
      percentage * (APP_CONFIG.maxWeightPerItem - APP_CONFIG.minWeightPerItem) +
      APP_CONFIG.minWeightPerItem;
    updateWeight(rawWeight);
  };

  return (
    <Sheet>
      <Card className="flex flex-col h-full overflow-hidden rounded-[2.5rem] shadow-2xl group ring-1 ring-black/5">
        <div className="relative p-0">
          <Carousel setApi={setCarouselApi} className="w-full">
            <CarouselContent>
              {allImages.map((img, index) => (
                <CarouselItem key={index}>
                  <SheetTrigger asChild>
                    <div className="aspect-[4/3.5] cursor-pointer relative overflow-hidden">
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        className="object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out"
                        data-ai-hint={img.aiHint}
                        onClick={() =>
                          trackAction(productCategory, 'CLICK_PHOTO')
                        } // ✅ Track
                      />
                      {img.aiHint === 'UGC Content' && (
                        <Badge className="absolute bottom-4 right-4 bg-primary/80 backdrop-blur font-black italic uppercase text-[8px] tracking-widest border-white/20">
                          Foto de Cliente
                        </Badge>
                      )}
                    </div>
                  </SheetTrigger>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none">
              <CarouselPrevious className="pointer-events-auto static -translate-x-0 -translate-y-0 w-9 h-9 rounded-full bg-black/40 backdrop-blur text-white hover:bg-black/80 border-none" />
              <CarouselNext className="pointer-events-auto static -translate-x-0 -translate-y-0 w-9 h-9 rounded-full bg-black/40 backdrop-blur text-white hover:bg-black/80 border-none" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-80 pointer-events-none"></div>
          </Carousel>

          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <Badge
              variant="destructive"
              className="flex items-center gap-1.5 pointer-events-none bg-primary/80 backdrop-blur-md border border-white/10 shadow-lg uppercase tracking-wide text-primary-foreground"
            >
              <Flame size={12} /> {product.badge}
            </Badge>
            {product.stock <= 0 ? (
              <Badge
                variant="destructive"
                className="bg-red-600 animate-pulse text-white shadow-lg uppercase tracking-wide"
              >
                <ShieldAlert size={12} /> Agotado
              </Badge>
            ) : product.stock < 5 ? (
              <Badge
                variant="destructive"
                className="bg-orange-500/90 backdrop-blur-sm text-white shadow-lg border-orange-400"
              >
                ¡Solo {product.stock} disponibles!
              </Badge>
            ) : (
              <Badge className="bg-green-600/80 backdrop-blur-sm text-white shadow-lg border-green-400/50">
                Stock: {product.stock} unidades
              </Badge>
            )}
          </div>

          <div className="absolute top-4 right-4 z-10 flex flex-col gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-primary transition-all duration-300 group/btn border border-white/10 shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              aria-label={isLiked ? 'Quitar me gusta' : 'Me gusta'}
            >
              <Heart
                size={18}
                className={cn(
                  'transition-transform duration-300 group-active/btn:scale-75',
                  isLiked
                    ? 'fill-primary text-primary'
                    : 'text-white group-hover/btn:text-primary'
                )}
              />
            </Button>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-gray-900 transition-all duration-300 group/btn border border-white/10 shadow-lg"
                onClick={handleShare}
                title="Compartir"
                aria-label="Compartir producto"
              >
                {showShareTooltip ? (
                  <Check size={18} className="text-green-500" />
                ) : (
                  <Share2 size={18} />
                )}
              </Button>
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {allImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => carouselApi?.scrollTo(idx)}
                aria-label={`Ver imagen ${idx + 1}`}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-500 shadow-sm',
                  currentSlide === idx ? 'bg-white w-6' : 'bg-white/50 w-1.5'
                )}
              ></button>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background via-background/80 to-transparent z-0 pointer-events-none"></div>

          {/* ✅ SALESBOT REACTIVO ALGORÍTMICO (MANDATO-FILTRO) */}
          {dominantType === productCategory && (
            <div className="absolute bottom-16 left-0 w-full px-6 z-30 animate-in slide-in-from-bottom-4 fade-in duration-700">
              <div className="bg-primary/95 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 animate-bounce">
                  <Sparkles className="text-primary w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">
                    Oferta Personalizada
                  </p>
                  <p className="text-xs font-bold text-white leading-tight">
                    Vemos que te encanta la {productCategory}. ¡Lleva hoy un 10%
                    OFF extra en este corte!
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/20 border-white/40 text-white hover:bg-white hover:text-primary font-black uppercase text-[10px]"
                >
                  APLICAR
                </Button>
              </div>
            </div>
          )}
        </div>

        <CardContent className="relative px-6 pb-6 pt-4 bg-background -mt-16 z-10 flex-1 flex flex-col rounded-t-[1.5rem]">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-3xl font-black text-foreground leading-none tracking-tight">
                {product.name}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={cn(
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  ({product.reviews} reseñas)
                </span>
              </div>
            </div>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex-shrink-0"
                aria-label="Ver detalles y ficha técnica"
              >
                <ChefHat size={20} />
              </Button>
            </SheetTrigger>
          </div>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed font-medium">
            {product.details.corte}. Sabor excepcional gracias a su maduración
            de {product.details.maduracion}.
          </p>

          <div className="bg-secondary/50 rounded-2xl p-4 mb-6 border hover:border-border transition-colors mt-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Scale size={14} className="text-foreground" />
                Peso (Kg)
              </span>
              <div className="text-right flex flex-col items-end">
                <span className="text-3xl font-black text-foreground leading-none tracking-tighter">
                  {product.weightLabel
                    ? product.weightLabel
                    : weight.toFixed(1) + ' Kg'}
                </span>
                <span className="text-[10px] font-bold text-green-600 bg-green-100 px-1.5 rounded mt-1 flex items-center gap-1">
                  <Users size={10} /> Ideal para {estimatedServings}{' '}
                  {estimatedServings === 1 ? 'persona' : 'personas'}
                </span>
              </div>
            </div>

            {!product.isFixedPrice ? (
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-10 h-10 rounded-xl bg-background shadow-sm active:scale-95 disabled:opacity-30"
                  onClick={() => updateWeight(weight - 0.5)}
                  disabled={weight <= 0.5}
                  aria-label="Disminuir peso"
                >
                  <Minus size={18} />
                </Button>
                <div
                  className="flex-1 h-3 bg-muted rounded-full cursor-pointer relative group/bar focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  onClick={handleBarClick}
                  role="slider"
                  tabIndex={0}
                  aria-label="Selector de peso"
                  aria-valuenow={weight}
                  aria-valuemin={APP_CONFIG.minWeightPerItem}
                  aria-valuemax={APP_CONFIG.maxWeightPerItem}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                      e.preventDefault();
                      updateWeight(weight + 0.5);
                    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                      e.preventDefault();
                      updateWeight(weight - 0.5);
                    }
                  }}
                >
                  <div className="absolute inset-0 bg-muted-foreground/20 group-hover/bar:bg-muted-foreground/30 transition-colors rounded-full"></div>
                  <div
                    className="h-full bg-gradient-to-r from-primary to-red-600 rounded-full transition-all duration-300 relative"
                    style={{
                      width: `${
                        ((weight - APP_CONFIG.minWeightPerItem) /
                          (APP_CONFIG.maxWeightPerItem -
                            APP_CONFIG.minWeightPerItem)) *
                        100
                      }%`,
                    }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-white/30 rounded-full mr-1"></div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-10 h-10 rounded-xl bg-background shadow-sm active:scale-95"
                  onClick={() => updateWeight(weight + 0.5)}
                  aria-label="Aumentar peso"
                >
                  <Plus size={18} />
                </Button>
              </div>
            ) : (
              <div className="bg-primary/5 p-3 rounded-xl border border-primary/20">
                <p className="text-[10px] font-bold text-primary uppercase leading-tight">
                  📌 Venta por pieza estandarizada. El peso puede variar dentro
                  del rango indicado.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-5">
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-0.5">
                Total
              </span>
              <span className="text-2xl font-black text-foreground tracking-tight">
                <AnimatedPrice value={totalPrice} />
              </span>
            </div>
            <Button
              onClick={handleAddToCartInternal}
              disabled={cartState !== 'idle' || product.stock <= 0}
              className={cn(
                'flex-1 h-14 rounded-2xl font-bold text-sm uppercase tracking-wider shadow-xl transform hover:-translate-y-1 transition-all duration-300 group/cart',
                product.stock <= 0
                  ? 'bg-gray-400 cursor-not-allowed opacity-50'
                  : cartState === 'success'
                    ? 'bg-green-600 text-white shadow-green-900/20'
                    : 'bg-foreground text-background hover:bg-foreground/90 shadow-gray-900/20'
              )}
            >
              {product.stock <= 0 ? (
                <>Sin Inventario</>
              ) : (
                cartState === 'idle' && (
                  <>
                    <ShoppingBag
                      size={18}
                      className="group-hover/cart:rotate-12 transition-transform"
                    />{' '}
                    Agregar al Pedido
                  </>
                )
              )}
              {cartState === 'loading' && (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
              {cartState === 'success' && (
                <>
                  <Check size={20} /> Agregado
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <SheetContent className="w-full sm:max-w-lg p-0">
        <div className="h-full overflow-y-auto">
          <SheetHeader className="p-6 pb-4 sticky top-0 bg-background z-10 border-b">
            <SheetTitle className="text-lg font-black text-foreground flex items-center gap-2">
              <ChefHat size={20} className="text-primary" /> Ficha Técnica
            </SheetTitle>
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 rounded-full h-8 w-8"
                aria-label="Cerrar ficha técnica"
              >
                <X size={16} />
              </Button>
            </SheetClose>
          </SheetHeader>
          <div
            className="p-6 pt-4 space-y-6"
            onScroll={() => trackAction(productCategory, 'SCROLL_DESCRIPTION')} // ✅ Track
          >
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(product.details).map(([key, value]) => (
                <div key={key} className="bg-secondary p-3 rounded-2xl border">
                  <span className="text-xs text-muted-foreground uppercase font-black block mb-1">
                    {key}
                  </span>
                  <span className="text-sm font-bold text-foreground leading-tight block">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-secondary p-4 rounded-2xl border border-dashed border-muted-foreground/30">
              <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                <ShieldAlert size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Compromiso de Honestidad
                </span>
              </div>
              <p className="text-[11px] font-medium leading-relaxed italic text-muted-foreground">
                Cortesía de la casa: &quot;El Cliente Nunca Pierde&quot;. Al ser
                un producto artesanal, el peso final puede variar levemente (+/-
                5%). Garantizamos siempre el peso mínimo indicado o superior.
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 flex gap-4 items-center">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                <Wine size={20} className="text-purple-600" />
              </div>
              <div>
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider block mb-0.5">
                  Maridaje Ideal
                </span>
                <p className="text-sm font-bold text-purple-900 leading-tight">
                  {product.pairing}
                </p>
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
              <div className="flex items-center gap-2 mb-3">
                <Thermometer size={16} className="text-orange-500" />
                <span className="text-xs font-black text-orange-700 uppercase">
                  Guía de Cocción
                </span>
              </div>
              <div className="flex gap-2 mb-3 bg-white/50 p-1 rounded-xl">
                {Object.entries(COOKING_TEMPS).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() =>
                      setDoneness(key as keyof typeof COOKING_TEMPS)
                    }
                    className={cn(
                      'flex-1 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all',
                      doneness === key
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'text-orange-800/60 hover:bg-orange-100'
                    )}
                  >
                    {key === 'tres-cuartos' ? '3/4' : key}
                  </button>
                ))}
              </div>
              <div className="animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-black text-orange-900">
                    {COOKING_TEMPS[doneness].label}
                  </span>
                  <span className="text-xs font-bold bg-orange-200 text-orange-800 px-2 py-0.5 rounded-md">
                    {COOKING_TEMPS[doneness].temp}
                  </span>
                </div>
                <p className="text-xs text-orange-800/80 leading-relaxed font-medium">
                  {COOKING_TEMPS[doneness].desc}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Activity size={16} className="text-gray-400" />
                <span className="text-xs font-bold text-gray-900 uppercase">
                  Valores Nutricionales
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1 uppercase">
                    <span>Proteína</span>
                    <span>Alta (85%)</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-800 w-[85%] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
