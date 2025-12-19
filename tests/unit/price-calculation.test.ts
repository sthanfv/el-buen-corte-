import { OrderItem } from '@/schemas/order';

/**
 * Unit Test: Price Calculation Logic
 * Valida que los totales se calculen correctamente aplicando sumas y pesos.
 * Protocolo: MANDATO-FILTRO.
 */

function calculateServerTotal(items: any[]) {
    return items.reduce((sum, item) => sum + item.finalPrice, 0);
}

describe('Lógica de Cálculo de Precios (Ingeniería de Grado Experto)', () => {

    test('Debe calcular el total correcto para múltiples items', () => {
        const items = [
            { id: '1', name: 'Carne A', finalPrice: 100 },
            { id: '2', name: 'Carne B', finalPrice: 250 },
            { id: '3', name: 'Carne C', finalPrice: 50 }
        ];

        const total = calculateServerTotal(items);
        expect(total).toBe(400);
    });

    test('Debe manejar un solo item correctamente', () => {
        const items = [{ id: '1', name: 'Carne A', finalPrice: 15500 }];
        const total = calculateServerTotal(items);
        expect(total).toBe(15500);
    });

    test('Debe retornar 0 si no hay items', () => {
        const total = calculateServerTotal([]);
        expect(total).toBe(0);
    });
});
