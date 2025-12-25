import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as createOrder } from '@/app/api/orders/create/route';
import { firebaseMocks, redisMocks, ratelimitMocks } from '../vitest.setup';

describe('Security: Redis Fail-Open Resilience', () => {
  const payload = {
    customerInfo: {
      customerName: 'Test User',
      customerPhone: '3113114357',
      customerAddress: 'Diagonal 18 # 20-30 Sur Bogota',
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
    habeasDataAccepted: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe permitir la creación de la orden incluso si Redis falla (Fail-Open)', async () => {
    // Force Redis failure for this test using shared mocks
    redisMocks.get.mockRejectedValue(new Error('Redis Down'));
    redisMocks.set.mockRejectedValue(new Error('Redis Down'));
    ratelimitMocks.limit.mockRejectedValue(new Error('Ratelimit Down'));

    firebaseMocks.get.mockResolvedValue({
      exists: true,
      data: () => ({ stock: 100 }),
    });

    const req = new Request('http://localhost/api/orders/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const res = await createOrder(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(firebaseMocks.set).toHaveBeenCalled();
  });
});
