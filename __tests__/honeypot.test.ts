import { NextResponse } from 'next/server';

// 1. MOCKS GLOBALES (DEBEN ESTAR ANTES DE CUALQUIER IMPORTACIÓN QUE LOS USE)
jest.mock('@upstash/redis', () => ({
    Redis: jest.fn().mockImplementation(() => ({
        set: jest.fn().mockResolvedValue('OK'),
    })),
}));

jest.mock('@/lib/firebase', () => ({
    adminDb: {
        collection: jest.fn().mockReturnValue({
            doc: jest.fn().mockReturnValue({
                set: jest.fn().mockResolvedValue({}),
                get: jest.fn().mockResolvedValue({ exists: false }),
            }),
            where: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
        }),
        runTransaction: jest.fn(),
    },
    adminAuth: {
        verifyIdToken: jest.fn().mockResolvedValue({ uid: 'test_user', admin: true }),
    },
}));

jest.mock('@/lib/logger', () => ({
    logger: {
        warn: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
        audit: jest.fn(),
    },
}));

jest.mock('next/headers', () => ({
    headers: jest.fn().mockResolvedValue({
        get: (key: string) => {
            if (key === 'Authorization') return 'Bearer valid_token';
            if (key === 'x-forwarded-for') return '127.0.0.1';
            if (key === 'user-agent') return 'Mozilla/5.0 (Bot)';
            return null;
        },
    }),
}));

// Mock de processOrderEvent
jest.mock('@/lib/events-handler', () => ({
    processOrderEvent: jest.fn().mockResolvedValue(true),
}));

// Importamos el controlador DESPUÉS de definir los mocks
import { POST as createOrder } from '@/app/api/orders/create/route';
const { adminDb } = require('@/lib/firebase');

/**
 * Honeypot Integration Test (MANDATO-FILTRO)
 */
describe('Honeypot Logic (Defensa Proactiva)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Debe detectar un bot si el campo business_fax está lleno', async () => {
        const payload = {
            customerInfo: {
                customerName: 'Cyber Bot',
                customerPhone: '1234567890',
                customerAddress: 'Calle Falsa 123',
                city: 'Bogota'
            },
            items: [{ id: '1', name: 'Product 1', finalPrice: 100, pricePerKg: 10, selectedWeight: 1 }],
            total: 100,
            paymentMethod: 'efectivo',
            business_fax: 'I AM A BOT', // 🍯 El campo trampa
        };

        const req = new Request('http://localhost/api/orders/create', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Authorization': 'Bearer valid_token' }
        });

        const res = await createOrder(req);
        const data = await res.json();

        // 1. Debe devolver el objeto conforme a route.ts (ok: true)
        expect(res.status).toBe(200);
        expect(data.ok).toBe(true);
        expect(data.id).toMatch(/^fake_ord_/);

        // 2. No debe haber llamado a la transacción de base de datos
        expect(adminDb.runTransaction).not.toHaveBeenCalled();
    });

    test('Debe permitir pedidos legítimos si el campo business_fax está vacío', async () => {
        const payload = {
            customerInfo: {
                customerName: 'Humano Real',
                customerPhone: '1234567890',
                customerAddress: 'Calle Falsa 123',
                city: 'Bogota'
            },
            items: [{ id: '1', name: 'Product 1', finalPrice: 100, pricePerKg: 10, selectedWeight: 1 }],
            total: 100,
            paymentMethod: 'efectivo',
            habeasDataAccepted: true,
            business_fax: '',
        };

        const req = new Request('http://localhost/api/orders/create', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Authorization': 'Bearer valid_token' }
        });

        adminDb.runTransaction.mockResolvedValue({ ok: true, id: 'real_order_123' });

        const res = await createOrder(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.ok).toBe(true);
        expect(adminDb.runTransaction).toHaveBeenCalled();
    });
});
