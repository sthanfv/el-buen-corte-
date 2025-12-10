'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/firebase/client';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

export default function AdminHeader() {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const pathname = usePathname();

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
        <header className="bg-white dark:bg-gray-800 shadow-sm mb-6 rounded-lg p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <Link href="/admin/dashboard" className="text-xl font-bold hover:text-primary transition-colors">
                    BuenCorte Admin
                </Link>
            </div>

            {user && (
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <UserIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">{user.email}</span>
                    </div>
                    <Button variant="destructive" size="sm" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar Sesión
                    </Button>
                </div>
            )}
        </header>
    );
}
