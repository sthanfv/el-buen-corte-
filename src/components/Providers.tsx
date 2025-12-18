'use client';

import { ToastProvider } from '@/components/ui/toast';
import { CartProvider } from '@/components/cart-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { Analytics } from '@vercel/analytics/react';
import CookieConsent from '@/components/CookieConsent';
import { SalesBotV2 } from '@/components/SalesBotV2';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <CartProvider>
                <ToastProvider>
                    {children}
                    <SalesBotV2 />
                    <CookieConsent />
                </ToastProvider>
            </CartProvider>
            <Analytics />
        </ThemeProvider>
    );
}
