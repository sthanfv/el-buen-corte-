'use client';
import { ToastProvider } from '@/components/ui/toast';
import { CartProvider } from '@/components/cart-provider';
import { SalesBot } from '@/components/SalesBot';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Analytics } from '@vercel/analytics/react';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

// Metadata se manejaría en un componente de servidor si fuera necesario
// export const metadata: Metadata = {
//   title: 'Buen Corte',
//   description: 'La mejor selección de carnes premium.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={cn('font-sans antialiased bg-background', fontSans.variable)}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CartProvider>
            <ToastProvider>
              {children}
              <SalesBot />
            </ToastProvider>
          </CartProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html >
  );
}
