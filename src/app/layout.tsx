import './globals.css';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/Providers';
import { CommandMenu } from '@/components/CommandMenu';

export const metadata = {
  title: 'El Buen Corte | Carnes Premium a Domicilio',
  description:
    'La mejor selección de cortes premium (Tomahawk, Picanha, Ribeye) entregados directamente a tu puerta en 24 horas.',
  keywords: ['carne', 'premium', 'asado', 'parrilla', 'delivery', 'bogota'],
  openGraph: {
    title: 'El Buen Corte | Carnes Premium',
    description:
      'Calidad superior para tus asados. Pide online y recibe en casa.',
    type: 'website',
  },
  authors: [{ name: 'El Buen Corte' }],
  robots: 'index, follow',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased')}>
        <Providers>
          {children}
          <CommandMenu />
        </Providers>
      </body>
    </html>
  );
}
