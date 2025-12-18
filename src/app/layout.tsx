import './globals.css';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/Providers';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata = {
  title: 'El Buen Corte | Carnes Premium a Domicilio',
  description: 'La mejor selección de cortes premium (Tomahawk, Picanha, Ribeye) entregados directamente a tu puerta en 24 horas.',
  keywords: ['carne', 'premium', 'asado', 'parrilla', 'delivery', 'bogota'],
  openGraph: {
    title: 'El Buen Corte | Carnes Premium',
    description: 'Calidad superior para tus asados. Pide online y recibe en casa.',
    type: 'website',
  },
};

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
        <Providers>
          {children}
        </Providers>
      </body>
    </html >
  );
}
