import { renderHook, waitFor } from '@testing-library/react';
import { useFeatureFlag } from '@/hooks/use-feature-flag';

// Mock Firebase Remote Config
const mockGetValue = jest.fn();
const mockFetchAndActivate = jest.fn().mockResolvedValue(true);

jest.mock('firebase/remote-config', () => ({
    getValue: () => ({
        asBoolean: mockGetValue
    }),
    fetchAndActivate: () => mockFetchAndActivate()
}));

jest.mock('@/firebase/client', () => ({
    remoteConfig: {} // Mock de objeto no nulo
}));

/**
 * Feature Flag Hook Test (MANDATO-FILTRO)
 * Verifica que el sistema de interruptores remotos responda correctamente a los valores de Firebase.
 */
describe('Feature Flag Hook (Control Operativo)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Debe retornar true si el flag está activado en Remote Config', async () => {
        mockGetValue.mockReturnValue(true);

        const { result } = renderHook(() => useFeatureFlag('enable_sales_bot'));

        await waitFor(() => {
            expect(result.current).toBe(true);
        });

        expect(mockFetchAndActivate).toHaveBeenCalled();
    });

    test('Debe retornar false si el flag está desactivado en Remote Config', async () => {
        mockGetValue.mockReturnValue(false);

        const { result } = renderHook(() => useFeatureFlag('enable_sales_bot'));

        await waitFor(() => {
            expect(result.current).toBe(false);
        });
    });

    test('Debe retornar true (fallback) si Remote Config falla', async () => {
        mockFetchAndActivate.mockRejectedValueOnce(new Error('Network Error'));

        const { result } = renderHook(() => useFeatureFlag('any_flag'));

        // El hook debe mantener su estado inicial (true por defecto en mi implementación)
        expect(result.current).toBe(true);
    });
});
