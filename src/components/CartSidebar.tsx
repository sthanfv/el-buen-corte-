'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingBag, Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { formatPrice } from '@/data/products';
import type { Product, OrderItem } from '@/types/products';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { Separator } from './ui/separator';
import { OrderFormModal } from './OrderFormModal';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/components/cart-provider';


interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({
  isOpen,
  onClose,
}: Props) {
  const [showOrderForm, setShowOrderForm] = useState(false);
  const { toast } = useToast();
  const { order, removeFromCart, updateCartItem, clearCart } = useCart();

  const total = order.reduce((acc, item) => acc + item.finalPrice, 0);

  // ✅ Update weight and recalculate price
  const updateWeight = (orderId: string, delta: number) => {
    const item = order.find(i => i.orderId === orderId);
    if (!item) return;

    const newWeight = Math.max(0.1, Math.min(50, item.selectedWeight + delta));
    updateCartItem(orderId, {
      selectedWeight: newWeight,
      finalPrice: newWeight * item.pricePerKg,
    });
  };

  const handleContinue = () => {
    if (order.length === 0) {
      toast({
        title: 'Carrito vacío',
        message: 'Agrega productos antes de continuar',
        type: 'error',
      });
      return;
    }
    setShowOrderForm(true);
  };

  const handleOrderSuccess = () => {
    // Clear cart after successful order
    setOrder([]);
    onClose();
    setShowOrderForm(false);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="flex flex-col w-full sm:max-w-lg p-0">
          {/* Header */}
          <SheetHeader className="p-6 border-b bg-gradient-to-r from-primary/5 to-primary/10">
            <SheetTitle className="font-black text-2xl flex items-center gap-3">
              <ShoppingCart className="h-7 w-7 text-primary" />
              Tu Carrito
              {order.length > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded-full">
                  {order.length}
                </span>
              )}
            </SheetTitle>
          </SheetHeader>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6">
            {order.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-6 py-12">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-8">
                  <ShoppingBag className="h-24 w-24 text-gray-400" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Tu carrito está vacío</h3>
                  <p className="text-muted-foreground">Agrega productos para comenzar tu pedido</p>
                </div>
                <SheetClose asChild>
                  <Button onClick={onClose} size="lg" className="mt-4">
                    Ver Productos
                  </Button>
                </SheetClose>
              </div>
            ) : (
              <div className="space-y-4">
                {order.map((item) => (
                  <div
                    key={item.orderId}
                    className="flex gap-4 p-4 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-xl hover:border-primary/30 transition-all"
                  >
                    {/* Product Image */}
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      <Image
                        src={item.images[0].src}
                        alt={item.images[0].alt}
                        fill
                        sizes="96px"
                        className="object-cover"
                        data-ai-hint={item.images[0].aiHint}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-base leading-tight mb-1 truncate">
                        {item.name}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        ${item.pricePerKg.toLocaleString('es-CO')}/kg • {item.category}
                      </p>

                      {/* Weight Controls */}
                      <div className="flex items-center gap-3 mb-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => updateWeight(item.orderId, -0.1)}
                          disabled={item.selectedWeight <= 0.1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>

                        <div className="flex-1 text-center">
                          <span className="font-bold text-lg">
                            {item.selectedWeight.toFixed(1)}
                          </span>
                          <span className="text-sm text-muted-foreground ml-1">kg</span>
                        </div>

                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => updateWeight(item.orderId, 0.1)}
                          disabled={item.selectedWeight >= 50}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Price and Remove */}
                      <div className="flex justify-between items-center">
                        <span className="font-black text-lg text-primary">
                          {formatPrice(item.finalPrice)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() => {
                            const idx = order.findIndex(i => i.orderId === item.orderId);
                            if (idx !== -1) removeFromCart(idx);
                          }}
                        >
                          <Trash2 size={16} className="mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with Total and Continue Button */}
          {order.length > 0 && (
            <div className="p-6 border-t bg-gradient-to-r from-primary/5 to-primary/10 space-y-4">
              <Separator className="mb-4" />

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-muted-foreground">
                  Total Estimado:
                </span>
                <span className="text-3xl font-black text-primary">
                  {formatPrice(total)}
                </span>
              </div>

              {/* Continue Button */}
              <Button
                onClick={handleContinue}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Continuar con el Pedido
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Completa tus datos en el siguiente paso
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Order Form Modal */}
      <OrderFormModal
        isOpen={showOrderForm}
        onClose={() => setShowOrderForm(false)}
        order={order}
        total={total}
        onSuccess={handleOrderSuccess}
      />
    </>
  );
}
