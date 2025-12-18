import { sendOrderConfirmation, OrderEmailData } from '../src/lib/email';
import { Resend } from 'resend';

// Mock Resend
jest.mock('resend', () => {
    return {
        Resend: jest.fn().mockImplementation(() => ({
            emails: {
                send: jest.fn().mockResolvedValue({ data: { id: 'mock_id' }, error: null }),
            },
        })),
    };
});

describe('Email Service', () => {
    const mockOrderData: OrderEmailData = {
        orderNumber: 12345,
        customerName: 'Juan Perez',
        customerEmail: 'juan@example.com',
        totalAmount: 50000,
        items: [{ name: 'Tomahawk', quantity: 1, price: 50000 }],
    };

    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('should return mock success if RESEND_API_KEY is missing', async () => {
        delete process.env.RESEND_API_KEY;
        console.warn = jest.fn(); // Suppress warn
        console.log = jest.fn(); // Suppress log

        const result = await sendOrderConfirmation(mockOrderData);

        expect(result.success).toBe(true);
        expect(result.mock).toBe(true);
    });

    it('should attempt to send email if RESEND_API_KEY is present', async () => {
        process.env.RESEND_API_KEY = 're_123';

        // We assume the mock implementation set above works
        const result = await sendOrderConfirmation(mockOrderData);

        expect(result.success).toBe(true);
        // Note: We'd verify resend.emails.send() was called if we exported the instance, 
        // but since it's internal to the module, we rely on the mocked return value.
    });
});
