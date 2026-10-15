import type { ID, Money } from './common';
import type { Product } from './product';

export type CartItem = {
  product: Product;
  quantity: number;
  /** Selected size; undefined = the product's default size/price. */
  volumeMl?: number;
};

export type CartSummary = {
  itemCount: number;
  subtotal: Money;
  shipping: Money;
  total: Money;
  currency: string;
};

export type WishlistEntry = ID;
