'use client';

import { useState, useEffect, useCallback } from 'react';
import { useActivityTracker } from '@/hooks/use-activity-tracker';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, X, ShoppingBag, TrendingUp, AlertTriangle, Info, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/cart-provider';
import { Product } from '@/types/products';
import { SalesBotEngine } from '@/lib/salesbot-engine';
import { SalesBotContext, SalesBotMessage } from '@/types/salesbot';
import { SALESBOT_ACTIONS } from '@/lib/salesbot-messages';
import { isFeatureEnabled } from '@/lib/features';

const ICON_MAP: Record<string, LucideIcon> = {
    sparkles: Sparkles,
    cart: ShoppingBag,
    trending: TrendingUp,
    alert: AlertTriangle,
    info: Info,
};

export function SalesBotV2() {
    const { logEvent } = useActivityTracker();
    const pathname = usePathname();
    const router = useRouter();
    const { order, addToCart } = useCart();

    const [isVisible, setIsVisible] = useState(false);
    const [currentMessage, setCurrentMessage] = useState<SalesBotMessage | null>(null);
    const [botEngine, setBotEngine] = useState<SalesBotEngine | null>(null);
    const [lastInteraction, setLastInteraction] = useState(Date.now());

    // Reset timer on navigation
    useEffect(() => {
        setLastInteraction(Date.now());
    }, [pathname]);

    // Initialize bot engine
    useEffect(() => {
        const initEngine = async () => {
            const context: SalesBotContext = {
                currentProduct: null,
                currentCategory: null,
                viewedProducts: [],
                cartItems: order,
                totalCartValue: order.reduce((sum, item) => sum + (item.totalPrice || 0), 0),
                isFirstVisit: !localStorage.getItem('bc_last_visit'),
                previousProduct: null,
            };

            const engine = new SalesBotEngine(context);
            await engine.loadProducts();
            setBotEngine(engine);
        };

        initEngine();
    }, [order]);

    // Update engine context when cart changes
    useEffect(() => {
        if (botEngine) {
            botEngine.updateContext({
                cartItems: order,
                totalCartValue: order.reduce((sum, item) => sum + (item.totalPrice || 0), 0),
            });
        }
    }, [order, botEngine]);

    // Evaluation loop
    useEffect(() => {
        const timer = setInterval(async () => {
            if (!botEngine || isVisible) return;

            const timeOnPage = (Date.now() - lastInteraction) / 1000;

            // Only evaluate after user has been on page for a bit
            if (timeOnPage < 10) return;

            const message = await botEngine.evaluateAndGetMessage();
            if (message) {
                showMessage(message);
            }
        }, 7000); // Check every 7 seconds

        return () => clearInterval(timer);
    }, [botEngine, isVisible, lastInteraction]);

    // Return visitor check
    useEffect(() => {
        try {
            const lastVisit = localStorage.getItem('bc_last_visit');
            const now = Date.now();

            if (lastVisit && /^\d+$/.test(lastVisit)) {
                const timestamp = parseInt(lastVisit, 10);

                if (!isNaN(timestamp) && timestamp < now && timestamp > (now - 30 * 24 * 60 * 60 * 1000)) {
                    const days = (now - timestamp) / (1000 * 60 * 60 * 24);
                    if (days > 1 && days < 7) {
                        setTimeout(() => {
                            setCurrentMessage({
                                message: "¡Qué bueno verte de nuevo! Tenemos cortes frescos hoy.",
                                icon: 'trending',
                                ruleId: 'return_visitor',
                                priority: 30,
                            });
                            setIsVisible(true);
                        }, 2000);
                    }
                }
            }
            localStorage.setItem('bc_last_visit', now.toString());
        } catch (error) {
            // Fail silently
        }
    }, []);

    const showMessage = (message: SalesBotMessage) => {
        setCurrentMessage(message);
        setIsVisible(true);

        // Track bot trigger
        logEvent('view_page', {
            metadata: {
                salesbot_triggered: true,
                rule: message.ruleId,
            },
        });

        // Auto-dismiss after 12s (increased for actions)
        setTimeout(() => setIsVisible(false), 12000);
    };

    const handleAction = useCallback((actionType: string) => {
        if (actionType === SALESBOT_ACTIONS.CLOSE) {
            setIsVisible(false);
            return;
        }

        if (actionType === SALESBOT_ACTIONS.ADD_TO_CART && botEngine) {
            const context = (botEngine as any).context as SalesBotContext;
            if (context.currentProduct) {
                // Convert Product to OrderItem for the cart
                const orderItem: any = {
                    ...context.currentProduct,
                    quantity: 1,
                    weight: 1, // Default or previous selection
                    totalPrice: context.currentProduct.pricePerKg
                };
                addToCart(orderItem);
                setIsVisible(false);
            }
            return;
        }

        if (actionType === SALESBOT_ACTIONS.CHECKOUT) {
            router.push('/#carrito');
            setIsVisible(false);
            return;
        }

        if (actionType.startsWith('/') || actionType.startsWith('#')) {
            router.push(actionType);
            setIsVisible(false);
            return;
        }

        setIsVisible(false);
    }, [botEngine, router, addToCart]);

    const dismiss = () => setIsVisible(false);

    // Expose global tracking methods
    useEffect(() => {
        if (typeof window !== 'undefined' && botEngine) {
            (window as any).salesBotSetProduct = async (product: Product) => {
                const orderItem: any = {
                    ...product,
                    quantity: 1,
                    weight: 1,
                    totalPrice: product.pricePerKg
                };
                addToCart(orderItem);
            };

            (window as any).salesBotTrackView = async (product: Product) => {
                const context = (botEngine as any).context as SalesBotContext;
                const updated = [...context.viewedProducts, product];

                botEngine.updateContext({
                    viewedProducts: updated,
                });
            };
        }
    }, [botEngine]);

    if (!isFeatureEnabled('salesBotV2') || !isVisible || !currentMessage) return null;

    const IconComponent = ICON_MAP[currentMessage.icon] || Sparkles;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 50, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 20, opacity: 0, scale: 0.9 }}
                className="fixed bottom-6 right-6 z-50 max-w-sm w-full md:w-96"
            >
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl p-4 flex flex-col gap-3 backdrop-blur-sm bg-opacity-95">
                    <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full shrink-0 ${currentMessage.icon === 'alert'
                            ? 'bg-red-100 dark:bg-red-900/30'
                            : 'bg-primary/10'
                            }`}>
                            <IconComponent className={`h-6 w-6 ${currentMessage.icon === 'alert'
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-primary'
                                }`} />
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-start">
                                <h5 className="font-semibold text-sm text-primary">Asistente de Cortes Premium</h5>
                                <button
                                    onClick={dismiss}
                                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                                    aria-label="Cerrar"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                {currentMessage.message}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    {currentMessage.actions && currentMessage.actions.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                            {currentMessage.actions.map((action, idx) => (
                                <Button
                                    key={idx}
                                    variant={action.primary ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleAction(action.action)}
                                    className="text-xs"
                                >
                                    {action.label}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
