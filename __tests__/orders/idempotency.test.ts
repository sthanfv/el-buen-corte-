import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as createOrder } from '@/app/api/orders/create/route';
import { firebaseMocks } from '../vitest.setup';

describe('Order Idempotency', () => {
  const payload = {
    customerInfo: {
      customerName: 'Test User',
      customerPhone: '3113114357',
      customerAddress: 'Calle de los Carniceros 123',
      city: 'Bogota',
    },
    items: [
      {
        id: '1',
        name: 'P1',
        selectedWeight: 1,
        finalPrice: 100,
        pricePerKg: 100,
      },
    ],
    total: 100,
    paymentMethod: 'efectivo',
    idempotencyKey: 'key_123',
    habeasDataAccepted: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe retornar la orden existente si la idempotencyKey ya fue usada', async () => {
    firebaseMocks.get.mockImplementation(async (refOrQuery: any) => {
      if (refOrQuery.where || refOrQuery._queryOptions) {
        return {
          empty: false,
          docs: [{ id: 'duplicate_id', data: () => ({ status: 'CREATED' }) }],
        };
      }
      return { exists: true, data: () => ({ stock: 10 }) };
    });

    const req = new Request('http://localhost/api/orders/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const res = await createOrder(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.duplicate).toBe(true);
    expect(firebaseMocks.set).not.toHaveBeenCalled();
  });
});
