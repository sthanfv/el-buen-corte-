'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { MessageSquareQuote, Loader2, CheckCircle2 } from 'lucide-react';
import { CustomerInfoSchema, type CustomerInfo } from '@/schemas/order';
import type { OrderItem } from '@/types/products';
import { formatPrice } from '@/data/products';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/firebase/client';
import { signInAnonymously } from 'firebase/auth';
import { track } from '@/lib/analytics-client';
import { useEffect } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  order: OrderItem[];
  total: number;
  onSuccess: () => void;
}

export function OrderFormModal({
  isOpen,
  onClose,
  order,
  total,
  onSuccess,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [habeasDataAccepted, setHabeasDataAccepted] = useState(false);
  const { toast } = useToast();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  useEffect(() => {
    if (isOpen && !orderId) {
      track('START_CHECKOUT', { itemCount: order.length, total });
    }

    // Track abandonment on close/unmount
    return () => {
      if (isOpen && !orderId) {
        track('ABANDON_CHECKOUT', { itemCount: order.length, total });
      }
    };
  }, [isOpen, orderId, order.length, total]);

  const form = useForm<CustomerInfo>({
    resolver: zodResolver(CustomerInfoSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      neighborhood: '',
      city: 'Bogotá',
      notes: '',
      deliveryDate: '',
      deliveryTime: '',
      requiresInvoice: false,
      invoiceNIT: '',
      invoiceCompanyName: '',
      invoiceEmail: '',
    },
  });

  const onSubmit = async (data: CustomerInfo) => {
    setIsSubmitting(true);

    try {
      // ✅ SECURITY: Ensure user is authenticated (Anonymous Auth)
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
      // ✅ SECURITY: Get Firebase auth token
      const idToken = await auth.currentUser?.getIdToken();

      // Prepare order payload
      const orderPayload = {
        customerInfo: data,
        idempotencyKey, // ✅ Track request for idempotency
        items: order.map((item) => ({
          id: item.id || item.orderId,
          name: item.name,
          selectedWeight: item.selectedWeight,
          finalPrice: item.finalPrice,
          pricePerKg: item.pricePerKg,
          category: item.category,
          imageUrl: item.images?.[0]?.src,
          weightLabel: item.weightLabel,
          isFixedPrice: item.isFixedPrice,
        })),
        total,
        paymentMethod: 'efectivo' as const,
        source:
          new URLSearchParams(window.location.search).get('utm_source') ||
          new URLSearchParams(window.location.search).get('source') ||
          'direct',
      };

      // ✅ SECURITY: Call secure API endpoint
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
        },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar el pedido');
      }

      const result = await response.json();
      setOrderId(result.id);

      // Show success message
      toast({
        title: '¡Pedido recibido!',
        message: `ID: ${result.id.slice(0, 8).toUpperCase()}`,
        type: 'success',
      });

      // ✅ Open WhatsApp if URL available
      if (result.whatsappURL) {
        window.open(result.whatsappURL, '_blank');
      }

      track('ORDER_CREATED', { orderId: result.id, total });
      onSuccess();
    } catch (error) {
      console.error('Error en pedido:', error);
      toast({
        title: 'Error',
        message: (error as Error).message || 'No se pudo procesar tu pedido.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderId) {
    // ✅ MANDATO-FILTRO: CTA Psicológico para forzar cierre por WhatsApp
    // ✅ CRÍTICO: Número SIN el + para compatibilidad móvil (iPhone/Android)
    const cleanPhone = '573113114357'; // SIN símbolos
    const orderRef = `#ORD-${orderId.slice(0, 8).toUpperCase()}`;
    const message = `🥩 ¡Hola El Buen Corte!

Acabo de hacer el pedido: *${orderRef}*
Total a pagar: *${formatPrice(total)}*

Quedo atento para enviar el comprobante de pago.`;

    const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px] text-center p-8">
          <div className="flex flex-col items-center gap-6">
            {/* Success Icon */}
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-foreground">
                ¡Pedido Recibido!
              </h2>
              <p className="text-muted-foreground text-sm">
                Tu orden{' '}
                <span className="font-mono font-bold text-primary text-base">
                  {orderRef}
                </span>{' '}
                ha sido reservada.
              </p>
            </div>

            {/* Warning Box */}
            <div className="bg-orange-50 border-2 border-orange-200 p-4 rounded-xl w-full">
              <p className="text-sm font-bold text-orange-900 mb-2">
                ⚠️ Importante: Confirma tu pago
              </p>
              <p className="text-xs text-orange-700 leading-relaxed">
                Para confirmar el despacho,{' '}
                <strong>finaliza tu pago en WhatsApp</strong>.
                <br />
                Si no confirmas en <strong>1 hora</strong>, el sistema liberará
                el stock.
              </p>
            </div>

            {/* Botón Copiar Cuenta - PASO 4 */}
            <div className="bg-gray-100 p-4 rounded-lg w-full text-left">
              <p className="text-sm text-gray-600 mb-2">
                💳 Cuenta Bancolombia / Nequi:
              </p>
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-lg">
                  311 311 4357
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('3113114357');
                    toast({
                      type: 'success',
                      title: '¡Copiado!',
                      message: 'Número de cuenta copiado al portapapeles',
                    });
                  }}
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded font-medium transition-colors"
                >
                  📋 Copiar
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                A nombre de: El Buen Corte
              </p>
            </div>

            {/* WhatsApp CTA - PRIMARY */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-5 px-6 rounded-xl shadow-2xl transform transition hover:scale-105 flex items-center justify-center gap-3 text-base uppercase tracking-wide"
            >
              <span className="text-2xl">📲</span>
              <span>Confirmar y Pagar por WhatsApp</span>
            </a>

            {/* Secondary Actions */}
            <div className="flex flex-col gap-2 w-full">
              <Button
                onClick={() =>
                  window.open(`/api/orders/status/${orderId}`, '_blank')
                }
                variant="outline"
                size="sm"
                className="w-full"
              >
                Ver Estado del Pedido
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Volver a la Tienda
              </Button>
            </div>

            {/* Footer Note */}
            <p className="text-xs text-gray-400 mt-2">
              💡 Tip: Guarda el número {orderRef} para rastrear tu pedido
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            Completa tu Pedido
          </DialogTitle>
          <DialogDescription>
            Ingresa tus datos de entrega. El pedido se enviará por WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo *</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="customerPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono / WhatsApp *</FormLabel>
                  <FormControl>
                    <Input placeholder="+57 300 123 4567" {...field} />
                  </FormControl>
                  <FormDescription>
                    Te contactaremos para confirmar tu pedido
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address */}
            <FormField
              control={form.control}
              name="customerAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección de Entrega *</FormLabel>
                  <FormControl>
                    <Input placeholder="Calle 45 #12-34, Apto 301" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Neighborhood and City */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="neighborhood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barrio</FormLabel>
                    <FormControl>
                      <Input placeholder="Chapinero" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciudad *</FormLabel>
                    <FormControl>
                      <Input placeholder="Bogotá" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Delivery Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="deliveryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Entrega</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliveryTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora Preferida</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Adicionales (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Indicaciones especiales, referencias, puntos de referencia..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Máximo 500 caracteres</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ✅ FACTURACIÓN ELECTRÓNICA (MANDATO-FILTRO) */}
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 space-y-4">
              <FormField
                control={form.control}
                name="requiresInvoice"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-bold text-purple-900">
                        📄 Requiero Factura Electrónica
                      </FormLabel>
                      <FormDescription className="text-xs text-purple-700">
                        Para empresas o personas jurídicas
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {form.watch('requiresInvoice') && (
                <div className="space-y-4 animate-in slide-in-from-top-2 fade-in duration-300">
                  <FormField
                    control={form.control}
                    name="invoiceNIT"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-purple-900">NIT *</FormLabel>
                        <FormControl>
                          <Input placeholder="900123456-7" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="invoiceCompanyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-purple-900">
                          Razón Social *
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Mi Empresa S.A.S." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="invoiceEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-purple-900">
                          Email de Facturación *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="facturacion@empresa.com"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          La factura electrónica será enviada a este correo
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            {/* Total Summary */}
            <div className="bg-primary/5 p-4 rounded-lg border-2 border-primary/20">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total del Pedido:</span>
                <span className="text-2xl font-black text-primary">
                  {formatPrice(total)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {order.length} producto{order.length > 1 ? 's' : ''}
              </p>
            </div>

            {/* ✅ HONEYPOT (DEFENSA PROACTIVA - MANDATO-FILTRO) */}
            {/* Este campo es invisible para humanos pero detectable por bots */}
            <div className="opacity-0 absolute -z-10 top-0 left-0 h-0 w-0 overflow-hidden">
              <label htmlFor="business_fax">
                Si eres humano, deja esto vacío (Fax de Negocio)
              </label>
              <Input
                id="business_fax"
                name="business_fax"
                tabIndex={-1}
                autoComplete="off"
                placeholder="F-123456"
              />
            </div>

            {/* Ley 1581 - Habeas Data */}
            <div className="flex items-start space-x-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
              <Checkbox
                id="habeas-data"
                checked={habeasDataAccepted}
                onCheckedChange={(checked) =>
                  setHabeasDataAccepted(checked as boolean)
                }
                className="mt-1"
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="habeas-data"
                  className="text-[10px] font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 uppercase tracking-tighter"
                >
                  Autorizo el tratamiento de mis datos personales
                </label>
                <p className="text-[9px] text-muted-foreground">
                  De acuerdo con la{' '}
                  <span className="font-bold underline">
                    Ley 1581 de 2012 (Habeas Data)
                  </span>
                  , autorizo de manera libre y expresa el uso de mi información
                  para la gestión de mi pedido en El Buen Corte.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !habeasDataAccepted}
                className="w-full bg-primary hover:bg-primary/90 text-white font-black italic uppercase tracking-widest py-6 rounded-xl shadow-xl shadow-primary/20 transition-all duration-300 disabled:opacity-50 disabled:grayscale"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <span className="animate-spin text-xl">⏳</span>
                    Procesando Pedido...
                  </div>
                ) : (
                  'Finalizar Compra Premium'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
