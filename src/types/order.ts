import type { ID, Money } from './common';

export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';

/** Independent of `OrderStatus` (fulfillment) — tracks whether payment has settled. */
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled' | 'refunded';

export type TransactionStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';

export type Transaction = {
  id: ID;
  provider: 'cod' | 'simulated';
  status: TransactionStatus;
  amount: Money;
  currency: string;
  providerReference?: string;
  failureReason?: string;
  createdAt: string;
};

/** Purchase-time snapshot — immutable once the order is placed, may not match the
 * product's current price/name/image if it's since changed or been removed. */
export type OrderLineItem = {
  productId: ID;
  productName: string;
  productImage: string;
  price: Money;
  quantity: number;
  volumeMl?: number;
};

export type ShippingAddress = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
};

export type Order = {
  id: ID;
  reference: string;
  placedAt: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items: OrderLineItem[];
  subtotal: Money;
  shipping: Money;
  total: Money;
  currency: string;
  shippingAddress: ShippingAddress;
  deliveryMethod: 'standard' | 'express';
  paymentMethod: 'card' | 'wallet' | 'cod';
  couponCode?: string;
  discountAmount?: Money;
  guestEmail?: string;
};
