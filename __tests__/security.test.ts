import { POST as createOrder } from '@/app/api/orders/create/route';
import { POST as updateOrder } from '@/app/api/orders/update/route';
import { NextResponse } from 'next/server';

// Mock dependencies
const mockAdd = jest.fn().mockResolvedValue({ id: 'mock_order_id' });
const mockDoc = jest.fn().mockReturnValue({
    get: jest.fn(),
    update: jest.fn(),
});

jest.mock('@/lib/firebase', () => ({
    adminDb: {
        collection: jest.fn().mockReturnValue({
            add: mockAdd,
            doc: mockDoc,
        }),
    },
    adminAuth: {
        verifyIdToken: jest.fn().mockResolvedValue({ uid: 'test_user', admin: true }),
    },
}));

jest.mock('next/headers', () => ({
    headers: jest.fn().mockResolvedValue({
        get: (key: string) => {
            if (key === 'Authorization') return 'Bearer valid_token';
            if (key === 'x-forwarded-for') return '127.0.0.1';
            return null;
        },
    }),
}));

jest.mock('@/lib/email', () => ({
    sendOrderConfirmation: jest.fn().mockResolvedValue({ success: true }),
}));

describe('Security Hardening Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Order Creation Hardening', () => {
        const validOrderPayload = {
            customerInfo: {
                customerName: 'Test User',
                customerPhone: '1234567890',
                customerAddress: 'Calle Falsa 123',
                city: 'Bogota',
            },
            items: [{ id: '1', name: 'Product 1', finalPrice: 100, pricePerKg: 10, selectedWeight: 1 }],
            total: 100,
            paymentMethod: 'efectivo',
        };

        it('should ALWAYS add _source: "api" to Firestore documents', async () => {
            const req = new Request('http://localhost/api/orders/create', {
                method: 'POST',
                body: JSON.stringify(validOrderPayload),
            });

            await createOrder(req);

            expect(mockAdd).toHaveBeenCalledWith(
                expect.objectContaining({
                    _source: 'api',
                })
            );
        });

        it('should SEAL the payload (recalculate total server-side)', async () => {
            const manipulatedPayload = {
                ...validOrderPayload,
                total: 1, // Maliciously low total
            };

            const req = new Request('http://localhost/api/orders/create', {
                method: 'POST',
                body: JSON.stringify(manipulatedPayload),
            });

            await createOrder(req);

            const savedData = mockAdd.mock.calls[0][0];
            expect(savedData.total).toBe(100); // Should be recalculated
        });
    });

    describe('Order Update Hardening', () => {
        it('should prevent updating orders in terminal states (delivered)', async () => {
            // Mock existing order in delivered state
            mockDoc().get.mockResolvedValueOnce({
                exists: true,
                data: () => ({ status: 'delivered' }),
            });

            const updatePayload = {
                id: 'order_123',
                updates: { status: 'pending' },
            };

            const req = new Request('http://localhost/api/orders/update', {
                method: 'POST',
                body: JSON.stringify(updatePayload),
            });

            const res = await updateOrder(req);
            expect(res.status).toBe(400);
            const json = await res.json();
            expect(json.error).toContain('entregado');
        });
    });
});
