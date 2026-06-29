import type { Order } from '@/types';
import { mockProducts } from './products.mock';

const find = (id: string) => mockProducts.find((p) => p.id === id)!;

export const mockOrders: Order[] = [
  {
    id: 'o-1',
    reference: 'AM-10293',
    placedAt: '2026-06-22',
    status: 'shipped',
    items: [
      { product: find('p-001'), quantity: 1 },
      { product: find('p-005'), quantity: 2 },
    ],
    summary: { itemCount: 3, subtotal: 780, shipping: 0, total: 780, currency: 'AED' },
    shippingAddress: 'Villa 12, Jumeirah, Dubai',
  },
  {
    id: 'o-2',
    reference: 'AM-10174',
    placedAt: '2026-05-30',
    status: 'delivered',
    items: [{ product: find('p-003'), quantity: 1 }],
    summary: { itemCount: 1, subtotal: 290, shipping: 20, total: 310, currency: 'AED' },
    shippingAddress: 'Villa 12, Jumeirah, Dubai',
  },
];
