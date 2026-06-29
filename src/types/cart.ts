import type { ID, Money } from './common';
import type { Product } from './product';

export type CartItem = {
  product: Product;
  quantity: number;
};

export type CartSummary = {
  itemCount: number;
  subtotal: Money;
  shipping: Money;
  total: Money;
  currency: string;
};

export type WishlistEntry = ID;
