'use client';

import { useState, useEffect } from 'react';
import { remoteConfig } from '@/firebase/client';
import { getValue, fetchAndActivate } from 'firebase/remote-config';

/**
 * useFeatureFlag (MANDATO-FILTRO: Nivel Google)
 * Hook para gestionar interruptores remotos en caliente via Firebase Remote Config.
 */
export function useFeatureFlag(flagName: string) {
    const [isEnabled, setIsEnabled] = useState<boolean>(true); // Fallback por defecto

    useEffect(() => {
        if (!remoteConfig) return;

        const fetchFlag = async () => {
            try {
                await fetchAndActivate(remoteConfig);
                const val = getValue(remoteConfig, flagName);
                setIsEnabled(val.asBoolean());
            } catch (err) {
                console.warn(`RemoteConfig: Fallo al obtener flag ${flagName}`, err);
            }
        };

        fetchFlag();
    }, [flagName]);

    return isEnabled;
}
