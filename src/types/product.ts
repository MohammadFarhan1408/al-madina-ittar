import type { ID, Money } from './common';

/** Olfactive family for an Ittar / perfume. */
export type ScentFamily =
  | 'oud'
  | 'floral'
  | 'amber'
  | 'musk'
  | 'woody'
  | 'citrus'
  | 'spicy';

export type ProductBadge = 'new' | 'bestseller' | 'limited' | 'exclusive';

export type Product = {
  id: ID;
  name: string;
  /** Arabic name for authentic luxury presentation. */
  nameAr?: string;
  brand: string;
  categoryId: ID;
  description: string;
  /** Top / heart / base notes for the detail screen. */
  notes: string[];
  scentFamily: ScentFamily;
  /** Volume in millilitres. */
  volumeMl: number;
  price: Money;
  /** Original price when discounted (price < originalPrice). */
  originalPrice?: Money;
  currency: string;
  images: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  badge?: ProductBadge;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isSignature: boolean;
  isSeasonal: boolean;
};
