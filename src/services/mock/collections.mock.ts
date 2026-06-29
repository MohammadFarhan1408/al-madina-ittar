import type { Collection } from '@/types';

const img = (id: string) =>
  `https://images.unsplash.com/${id}?w=700&q=80&auto=format&fit=crop`;

export const mockCollections: Collection[] = [
  {
    id: 'col-heritage',
    title: 'The Heritage Edit',
    subtitle: 'Timeless Arabian oud, reimagined',
    image: img('photo-1615634260167-c8cdede054de'),
    accent: 'gold',
    productCount: 12,
  },
  {
    id: 'col-rose',
    title: 'Rose Dynasty',
    subtitle: 'Taif & Damascena in full bloom',
    image: img('photo-1455659817273-f96807779a8a'),
    accent: 'burgundy',
    productCount: 9,
  },
  {
    id: 'col-emerald',
    title: 'Emerald Gardens',
    subtitle: 'Verdant, green and alive',
    image: img('photo-1547887538-e3a2f32cb1cc'),
    accent: 'emerald',
    productCount: 7,
  },
];
