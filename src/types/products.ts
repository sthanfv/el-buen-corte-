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
  createdAt?: Timestamp;
}
