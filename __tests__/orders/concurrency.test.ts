import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as createOrder } from '@/app/api/orders/create/route';
import { firebaseMocks } from '../vitest.setup';

describe('Order Concurrency Simulation', () => {
  const payload = {
    customerInfo: {
      customerName: 'Test User',
      customerPhone: '3113114357',
      customerAddress: 'Carrera 7 con Calle 72 Bogota',
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

  it('maneja múltiples intentos de compra simultáneos', async () => {
    firebaseMocks.get.mockResolvedValue({
      exists: true,
      data: () => ({ stock: 1 }),
    });

    const req = () =>
      new Request('http://localhost/api/orders/create', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    const requests = Array(3)
      .fill(null)
      .map(() => createOrder(req()));

    const outcomes = await Promise.all(requests);
    const successes = outcomes.filter((res) => res.status === 200).length;

    expect(successes).toBeGreaterThan(0);
  });
});
