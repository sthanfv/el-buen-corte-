'use client';

import { useState, useCallback, useEffect } from 'react';

/**
 * Hook: useInterestScoring
 * Implementa un Sistema de Scoring Ponderado basado en un Vector de Interés.
 * Vector: [Res, Cerdo, Pollo]
 * Lógica: Acumula puntos por acciones y dispara eventos al superar un Umbral (Threshold).
 * Protocolo: MANDATO-FILTRO.
 */

type ProductType = 'Res' | 'Cerdo' | 'Pollo';
type Vector = { [key in ProductType]: number };

const SCORING_RULES = {
    CLICK_PHOTO: 1,
    SCROLL_DESCRIPTION: 3,
    ADD_TO_CART: 5,
    REMOVE_FROM_CART: 10, // Alta intención/arrepentimiento
};

const THRESHOLD = 25; // Umbral para acción del SalesBot

export function useInterestScoring() {
    const [vector, setVector] = useState<Vector>({ Res: 0, Cerdo: 0, Pollo: 0 });
    const [dominantType, setDominantType] = useState<ProductType | null>(null);

    const trackAction = useCallback((type: ProductType, action: keyof typeof SCORING_RULES) => {
        setVector(prev => {
            const newScore = prev[type] + SCORING_RULES[action];
            const newVector = { ...prev, [type]: newScore };

            // Calcular dominante
            const entries = Object.entries(newVector) as [ProductType, number][];
            const max = entries.reduce((prev, curr) => curr[1] > prev[1] ? curr : prev);

            if (max[1] >= THRESHOLD) {
                setDominantType(max[0]);
            }

            return newVector;
        });
    }, []);

    return { vector, dominantType, trackAction };
}
