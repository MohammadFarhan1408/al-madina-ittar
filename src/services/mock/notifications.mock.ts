import type { AppNotification } from '@/types';

export const mockNotifications: AppNotification[] = [
  {
    id: 'n-1',
    kind: 'promo',
    title: 'Private Sale — 20% off Oud',
    body: 'For two days only, our Heritage oud collection is yours at an exclusive price.',
    date: '2026-06-27',
    read: false,
  },
  {
    id: 'n-2',
    kind: 'order',
    title: 'Your order has shipped',
    body: 'Order #AM-10293 is on its way. Tap to track your parcel.',
    date: '2026-06-26',
    read: false,
  },
  {
    id: 'n-3',
    kind: 'wishlist',
    title: 'Back in stock',
    body: 'Amber Noir, from your wishlist, is available again.',
    date: '2026-06-24',
    read: true,
  },
  {
    id: 'n-4',
    kind: 'system',
    title: 'Welcome to the Maison',
    body: 'Discover the art of Arabian perfumery, curated just for you.',
    date: '2026-06-20',
    read: true,
  },
];
