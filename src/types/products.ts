import type { Timestamp } from 'firebase/firestore';

export interface Product {
  id: string;
  name: string;
  category: string;
  pricePerKg: number;
  stock: number;
  images: {
    src: string;
    alt: string;
    aiHint: string;
  }[];
  rating: number;
  reviews: number;
  details: Record<string, string>;
  pairing: string;
  badge: string;
  tags?: string[];

  // ✅ MITIGACIÓN OPERATIVA (Peso Variable)
  weightLabel?: string;     // Ej: "Aprox. 900g - 1.1kg"
  minWeight?: number;       // Peso mínimo garantizado en kg
  isFixedPrice?: boolean;   // Si se cobra por pieza fija en lugar de gramaje exacto
  basePrice?: number;       // Precio por pieza fija (si isFixedPrice es true)

  createdAt?: Timestamp;
}

export interface OrderItem extends Product {
  orderId: string;
  selectedWeight: number; // en kg (reemplaza 'weight')
  finalPrice: number;     // precio calculado (reemplaza 'totalPrice')
}
