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
        router.push('/admin/login');
        return;
      }

      try {
        // Forzar la actualización del token para obtener los claims más recientes.
        const tokenResult = await getIdTokenResult(user, true);
        const isAdmin = tokenResult.claims.admin === true;

        if (isAdmin) {
          setAllow(true);
        } else {
          console.error('Acceso denegado. El usuario no es administrador.');
          await auth.signOut();
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Error verificando el token de administrador:', error);
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
