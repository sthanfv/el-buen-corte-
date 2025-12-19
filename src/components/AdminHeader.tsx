'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/firebase/client';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon, Shield } from 'lucide-react';
import Link from 'next/link';
import { ModeToggle } from '@/components/ModeToggle';

export default function AdminHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin/login');
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  // Don't show header on login page
  if (pathname === '/admin/login') return null;

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md shadow-lg border-b dark:border-zinc-800' : 'bg-white dark:bg-zinc-950 border-b dark:border-white/5'} mb-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 group transition-all"
          >
            <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-black italic tracking-tighter uppercase dark:text-white">
              Buen<span className="text-primary italic">Corte</span> <span className="text-[10px] bg-zinc-800 text-white px-2 py-0.5 rounded ml-1 font-mono align-middle">ADMIN</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {[
              { name: 'Dashboard', href: '/admin/dashboard' },
              { name: 'Experiencias', href: '/admin/experiences' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs font-black uppercase tracking-widest transition-all hover:text-primary ${pathname === item.href ? 'text-primary' : 'text-gray-500'}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />

          {user && (
            <div className="flex items-center gap-4 pl-4 border-l dark:border-white/10">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-[10px] font-black uppercase text-gray-500 tracking-tighter leading-none">Conectado como</span>
                <span className="text-xs font-bold dark:text-gray-300">{user.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border-transparent transition-all duration-300 group font-black italic uppercase text-[10px]"
              >
                <LogOut className="h-3 w-3 mr-1 group-hover:rotate-12 transition-transform" />
                SALIR
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
