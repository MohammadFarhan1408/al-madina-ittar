import type { CartItem, CartSummary } from './cart';
import type { ID } from './common';

export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type Order = {
  id: ID;
  reference: string;
  placedAt: string;
  status: OrderStatus;
  items: CartItem[];
  summary: CartSummary;
  shippingAddress: string;
};
