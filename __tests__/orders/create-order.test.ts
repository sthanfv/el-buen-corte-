import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as createOrder } from '@/app/api/orders/create/route';
import { firebaseMocks } from '../vitest.setup';

describe('Order Creation: Stock Integrity', () => {
  const validPayload = {
    customerInfo: {
      customerName: 'Test User',
      customerPhone: '3001234567',
      customerAddress: 'Calle Falsa 123 Bogota',
      city: 'Bogota',
    },
    items: [
      {
        id: '1',
        name: 'P1',
        selectedWeight: 1,
        finalPrice: 50000,
        pricePerKg: 50000,
      },
    ],
    total: 50000,
    paymentMethod: 'transferencia',
    habeasDataAccepted: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe fallar si no hay stock suficiente', async () => {
    firebaseMocks.get.mockResolvedValue({
      exists: true,
      data: () => ({ stock: 0 }),
    });

    const req = new Request('http://localhost/api/orders/create', {
      method: 'POST',
      body: JSON.stringify(validPayload),
    });
    const res = await createOrder(req);
    const data = await res.json();
    expect(res.status).toBe(500);
    expect(data.error).toMatch(/agotado/i);
  });

  it('debe descontar stock correctamente cuando hay disponibilidad', async () => {
    firebaseMocks.get.mockResolvedValue({
      exists: true,
      data: () => ({ stock: 10 }),
    });

    const req = new Request('http://localhost/api/orders/create', {
      method: 'POST',
      body: JSON.stringify(validPayload),
    });
    const res = await createOrder(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(firebaseMocks.update).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ stock: 9 })
    );
  });
});
