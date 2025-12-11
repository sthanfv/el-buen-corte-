'use client';

import { useState, useEffect } from 'react';
import { useActivityTracker } from '@/hooks/use-activity-tracker';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, X, ShoppingBag, TrendingUp, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/cart-provider';

// Internal Memory for the Session
interface SessionMemory {
    viewedCategories: Record<string, number>;
    viewedProducts: string[];
    lastInteraction: number;
}

export function SalesBot() {
    const { logEvent } = useActivityTracker(); // Initializes tracking automatically
    const pathname = usePathname();
    const { order } = useCart();
    // const order: any[] = []; // Temporary mock

    const [isVisible, setIsVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [BotIcon, setBotIcon] = useState<LucideIcon>(Sparkles as LucideIcon);
    const [memory, setMemory] = useState<SessionMemory>({
        viewedCategories: {},
        viewedProducts: [],
        lastInteraction: Date.now(),
    });

    // CLOSE BOT
    const dismiss = () => setIsVisible(false);

    // --- HEURISTIC ENGINE (The "Brain") ---
    useEffect(() => {
        const timer = setInterval(() => {
            evaluateHeuristics();
        }, 5000); // Check rules every 5 seconds

        return () => clearInterval(timer);
    }, [pathname, order, memory]);

    const evaluateHeuristics = () => {
        if (isVisible) return; // Don't interrupt if already speaking

        const now = Date.now();
        const timeOnPage = (now - memory.lastInteraction) / 1000;
        const isProductPage = pathname.startsWith('/product/');

        // RULE 1: INDECISION (Dwell time > 30s on product)
        if (isProductPage && timeOnPage > 30 && timeOnPage < 35) {
            triggerBot("¿Tienes dudas sobre este corte? Es ideal para la parrilla.", Sparkles);
            return;
        }

        // RULE 2: CART HESITATION (Items in cart, no checkout > 1 min)
        if (order.length > 0 && timeOnPage > 60 && !pathname.includes('cart')) {
            triggerBot(`Tienes ${order.length} cortes deliciosos esperando. ¿Los preparamos?`, ShoppingBag);
            return;
        }

        // RULE 3: CATEGORY OBSESSION (Viewed 3+ items of same category)
        // (Logic would rely on tracking adds, simplified here for demo)

        // RULE 4: WELCOME BACK (Local Storage)
        // Check once on mount
    };

    const triggerBot = (msg: string, Icon: any) => {
        setMessage(msg);
        setBotIcon(Icon);
        setIsVisible(true);
        // Auto-dismiss after 10s
        setTimeout(() => setIsVisible(false), 10000);
    };

    // --- RETURN VISITOR CHECK ---
    useEffect(() => {
        const lastVisit = localStorage.getItem('last_visit');
        const now = Date.now();

        if (lastVisit) {
            const days = (now - parseInt(lastVisit)) / (1000 * 60 * 60 * 24);
            if (days > 1) {
                setTimeout(() => triggerBot("¡Qué bueno verte de nuevo! Tenemos cortes frescos hoy.", TrendingUp), 2000);
            }
        }
        localStorage.setItem('last_visit', now.toString());
    }, []);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 50, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 20, opacity: 0, scale: 0.9 }}
                className="fixed bottom-6 right-6 z-50 max-w-sm w-full md:w-80"
            >
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl p-4 flex items-start gap-4 backdrop-blur-sm bg-opacity-95">
                    <div className="bg-primary/10 p-2 rounded-full shrink-0">
                        <BotIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                            <h5 className="font-semibold text-sm text-primary">Asistente Virtual</h5>
                            <button onClick={dismiss} className="text-zinc-400 hover:text-zinc-600">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                            {message}
                        </p>
                        {/* <div className="pt-1">
                    <Button variant="link" size="sm" className="h-auto p-0 text-primary">
                        Ver sugerencia &rarr;
                    </Button>
                </div> */}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
