'use client';
import { useEffect, useState } from 'react';
import { auth } from '@/firebase/client'; // Corrected import
import { onAuthStateChanged, getIdTokenResult } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Loader2, ChefHat } from 'lucide-react';

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [allow, setAllow] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAllow(false);
        router.push('/admin/login');
        return;
      }

      try {
        const tokenResult = await getIdTokenResult(user, true);

        // logs de depuración (MANDATO-FILTRO)
        console.log("DEBUG AUTH:", {
          uid: user.uid,
          email: user.email,
          providerId: user.providerData[0]?.providerId,
          claims: tokenResult.claims
        });

        const envWhitelist = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
        const WHITELIST = ['fv9316@gmail.com', 'admin@buencorte.co', ...envWhitelist];

        const isWhitelisted = user.email && WHITELIST.includes(user.email.toLowerCase());
        const isAdmin = tokenResult.claims.admin === true || isWhitelisted;

        if (isAdmin) {
          setAllow(true);
        } else {
          console.error(`Acceso denegado: El usuario ${user.email || user.uid || 'desconocido'} no tiene privilegios.`);
          setAllow(false);
          await auth.signOut();
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Error en validación de privilegios:', error);
        setAllow(false);
        router.push('/admin/login');
      }
    });

    return () => unsub();
  }, [router]);

  if (!allow) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
        <div className="flex items-center gap-2 mb-4">
          <ChefHat className="text-primary w-8 h-8" />
          <span className="text-2xl font-black tracking-tighter">
            Buen<span className="text-primary">Corte</span>
          </span>
        </div>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">
          Verificando credenciales...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
