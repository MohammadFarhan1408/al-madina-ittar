import type { Order } from '@/types';
import { mockProducts } from './products.mock';

const find = (id: string) => mockProducts.find((p) => p.id === id)!;

export const mockOrders: Order[] = [
  {
    id: 'o-1',
    reference: 'AM-10293',
    placedAt: '2026-06-22',
    status: 'shipped',
    paymentStatus: 'paid',
    items: [
      {
        productId: find('p-001').id,
        productName: find('p-001').name,
        productImage: find('p-001').images[0],
        price: find('p-001').price,
        quantity: 1,
      },
      {
        productId: find('p-005').id,
        productName: find('p-005').name,
        productImage: find('p-005').images[0],
        price: find('p-005').price,
        quantity: 2,
      },
    ],
    subtotal: 780,
    shipping: 0,
    total: 780,
    currency: 'AED',
    shippingAddress: { fullName: 'Amina Al Farsi', phone: '+971 50 000 0000', address: 'Villa 12, Jumeirah', city: 'Dubai' },
    deliveryMethod: 'standard',
    paymentMethod: 'card',
  },
  {
    id: 'o-2',
    reference: 'AM-10174',
    placedAt: '2026-05-30',
    status: 'delivered',
    paymentStatus: 'paid',
    items: [
      {
        productId: find('p-003').id,
        productName: find('p-003').name,
        productImage: find('p-003').images[0],
        price: find('p-003').price,
        quantity: 1,
      },
    ],
    subtotal: 290,
    shipping: 20,
    total: 310,
    currency: 'AED',
    shippingAddress: { fullName: 'Amina Al Farsi', phone: '+971 50 000 0000', address: 'Villa 12, Jumeirah', city: 'Dubai' },
    deliveryMethod: 'express',
    paymentMethod: 'cod',
  },
];
