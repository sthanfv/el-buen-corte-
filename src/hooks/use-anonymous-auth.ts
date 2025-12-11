import { useEffect, useState } from 'react';
import { auth } from '@/firebase/client';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';

export function useAnonymousAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setLoading(false);
            } else {
                // If no user is logged in, create a Shadow Profile (Anonymous)
                try {
                    // signInAnonymously persists session automatically
                    await signInAnonymously(auth);
                    // The onAuthStateChanged will fire again with the new anon user
                } catch (error) {
                    console.error("Shadow Profile creation failed:", error);
                    setLoading(false);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    return { user, loading };
}
