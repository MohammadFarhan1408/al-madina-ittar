import type { Category } from '@/types';

const img = (id: string) =>
  `https://images.unsplash.com/${id}?w=400&q=80&auto=format&fit=crop`;

export const mockCategories: Category[] = [
  {
    id: 'cat-oud',
    name: 'Oud',
    tagline: 'Liquid gold of the East',
    image: img('photo-1615634260167-c8cdede054de'),
    productCount: 24,
  },
  {
    id: 'cat-floral',
    name: 'Floral',
    tagline: 'Gardens in a vial',
    image: img('photo-1455659817273-f96807779a8a'),
    productCount: 31,
  },
  {
    id: 'cat-amber',
    name: 'Amber',
    tagline: 'Warmth & resin',
    image: img('photo-1547887538-e3a2f32cb1cc'),
    productCount: 18,
  },
  {
    id: 'cat-musk',
    name: 'Musk',
    tagline: 'Soft & sensual',
    image: img('photo-1592945403244-b3fbafd7f539'),
    productCount: 15,
  },
  {
    id: 'cat-woody',
    name: 'Woody',
    tagline: 'Sandal & cedar',
    image: img('photo-1610461888750-10bfc601b874'),
    productCount: 22,
  },
  {
    id: 'cat-spicy',
    name: 'Spicy',
    tagline: 'Saffron & cardamom',
    image: img('photo-1602928321679-560bb453f190'),
    productCount: 12,
  },
];
