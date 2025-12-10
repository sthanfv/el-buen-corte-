'use client';

import Image from 'next/image';
import { ShoppingBag, Trash2, X, MessageSquareQuote } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { formatPrice, APP_CONFIG } from '@/data/products';
import type { Product } from '@/types/products';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Input } from './ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

export interface OrderItem extends Omit<Product, 'images'> {
  images: { src: string; alt: string; aiHint: string }[];
  orderId: string;
  selectedWeight: number;
  finalPrice: number;
}

const OrderFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido.'),
  address: z.string().min(1, 'La dirección es requerida.'),
  paymentMethod: z.enum(['efectivo', 'transferencia'], {
    required_error: 'Debes seleccionar un método de pago.',
  }),
});

type OrderFormValues = z.infer<typeof OrderFormSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  order: OrderItem[];
  onRemove: (id: string) => void;
  setOrder: React.Dispatch<React.SetStateAction<OrderItem[]>>;
}

export default function OrderSidebar({
  isOpen,
  onClose,
  order,
  onRemove,
  setOrder,
}: Props) {
  const total = order.reduce((acc, item) => acc + item.finalPrice, 0);
  const { toast } = useToast();

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(OrderFormSchema),
    defaultValues: {
      name: '',
      address: '',
      paymentMethod: 'efectivo',
    },
  });

  const generateWhatsAppMessage = (data: OrderFormValues) => {
    const header = '*¡Nuevo Pedido de Buen Corte!* 🥩\n\n';
    const clientDetails =
      `*Datos del Cliente:*\n` +
      `*Nombre:* ${data.name}\n` +
      `*Dirección:* ${data.address}\n` +
      `*Método de Pago:* ${
        data.paymentMethod === 'efectivo' ? 'Efectivo' : 'Transferencia'
      }\n\n`;

    const orderDetails =
      `*Resumen del Pedido:*\n` +
      order
        .map(
          (item) =>
            `  - ${item.name} (${item.selectedWeight.toFixed(
              1
            )} Kg): *${formatPrice(item.finalPrice)}*`
        )
        .join('\n') +
      `\n\n`;

    const totalLine = `*TOTAL: ${formatPrice(total)}*`;
    return encodeURIComponent(
      header + clientDetails + orderDetails + totalLine
    );
  };

  const onSubmit = async (data: OrderFormValues) => {
    try {
      // 1. Prepare Order Data
      const orderPayload = {
        customerName: data.name,
        customerAddress: data.address,
        paymentMethod: data.paymentMethod,
        items: order.map((item) => ({
          id: item.id,
          name: item.name,
          selectedWeight: item.selectedWeight,
          finalPrice: item.finalPrice,
          pricePerKg: item.price,
        })),
        total: total,
      };

      // 2. Save to Backend (Optimistic: don't block user if fails, but log it)
      // Actually, we should block slightly to ensure we have the record.
      toast({
        title: 'Procesando...',
        message: 'Generando tu pedido para WhatsApp...',
      });

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        console.error('Error saving order', await res.text());
        // Proceed anyway so sales aren't lost, but maybe warn?
      }

      // 3. Generate WhatsApp Link
      const message = generateWhatsAppMessage(data);
      const whatsappUrl = `https://wa.me/${APP_CONFIG.whatsappNumber}?text=${message}`;

      window.open(whatsappUrl, '_blank');

      toast({
        type: 'success',
        title: '¡Pedido Iniciado!',
        message: 'Continúa la conversación en WhatsApp para finalizar.',
      });

      // 4. Clear Cart
      form.reset();
      setOrder([]);
      onClose();
    } catch (error) {
      console.error('Error in checkout', error);
      toast({
        type: 'error',
        message: 'Hubo un problema iniciando el pedido.',
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex flex-col w-full sm:max-w-md p-0">
        <SheetHeader className="p-6 border-b bg-gray-50">
          <SheetTitle className="font-black text-xl flex items-center gap-2">
            Tu Pedido ({order.length})
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {order.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 text-muted-foreground">
              <ShoppingBag className="h-20 w-20" strokeWidth={1} />
              <p>Tu pedido está vacío.</p>
              <SheetClose asChild>
                <Button onClick={onClose} variant="outline">
                  Seguir comprando
                </Button>
              </SheetClose>
            </div>
          ) : (
            order.map((item) => (
              <div
                key={item.orderId}
                className="flex gap-4 p-4 items-start bg-white border border-gray-100 rounded-2xl shadow-sm"
              >
                <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                  <Image
                    src={item.images[0].src}
                    alt={item.images[0].alt}
                    fill
                    sizes="80px"
                    className="object-cover"
                    data-ai-hint={item.images[0].aiHint}
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold leading-tight">{item.name}</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    {item.selectedWeight.toFixed(1)} Kg • {item.category}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="font-black text-primary">
                      {formatPrice(item.finalPrice)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-primary"
                      onClick={() => onRemove(item.orderId)}
                    >
                      <Trash2 size={16} />
                      <span className="sr-only">Remover item</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {order.length > 0 && (
          <SheetFooter className="p-6 border-t bg-gray-50 flex-col space-y-4">
            <div className="flex justify-between items-center font-black text-lg">
              <span>Total Estimado</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Separator />
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Tu nombre" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección de Entrega</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Calle 5 # 10-15, Apto 201"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Método de Pago</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="efectivo" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Efectivo
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="transferencia" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Transferencia
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full py-4 h-auto bg-green-600 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-green-700 transition-colors shadow-xl disabled:opacity-50 flex items-center gap-2"
                  disabled={order.length === 0}
                >
                  <MessageSquareQuote size={18} />
                  Enviar Pedido por WhatsApp
                </Button>
              </form>
            </Form>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
