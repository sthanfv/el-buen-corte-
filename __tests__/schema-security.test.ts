import { OrderSchema } from '@/schemas/order';

/**
 * Zod Security Hardening Test (MANDATO-FILTRO)
 * Verifica que las validaciones de esquema bloqueen intentos de XSS y datos malformados.
 */
describe('Order Schema Security (Zod Hardening)', () => {
    const validData = {
        customerInfo: {
            customerName: 'Juan Perez',
            customerPhone: '3101234567',
            customerAddress: 'Calle 123 #45-67',
            neighborhood: 'Cedritos',
            city: 'Bogota',
        },
        items: [{
            id: 'p1',
            name: 'Tomahawk',
            selectedWeight: 1.5,
            pricePerKg: 45000,
            finalPrice: 67500,
            images: [],
            category: 'Premium'
        }],
        total: 67500,
        paymentMethod: 'transferencia',
        habeasDataAccepted: true
    };

    test('Debe rechazar nombres con caracteres prohibidos (el regex real es estricto)', () => {
        const maliciousData = {
            ...validData,
            customerInfo: {
                ...validData.customerInfo,
                customerName: 'Juan!!' // Los signos de admiración no están permitidos
            }
        };

        const result = OrderSchema.safeParse(maliciousData);
        expect(result.success).toBe(false);
    });

    test('Debe rechazar direcciones sospechosamente largas o con caracteres prohibidos', () => {
        const maliciousData = {
            ...validData,
            customerInfo: {
                ...validData.customerInfo,
                customerAddress: 'Calle 123'.repeat(50) // Demasiado larga
            }
        };

        const result = OrderSchema.safeParse(maliciousData);
        expect(result.success).toBe(false);
    });

    test('Debe obligar a aceptar el Habeas Data (Ley 1581)', () => {
        const illegalData = {
            ...validData,
            habeasDataAccepted: false
        };

        const result = OrderSchema.safeParse(illegalData);
        expect(result.success).toBe(false);
    });
});
