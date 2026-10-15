import { AppConfig } from '@/core/config';
import { apiClient } from '@/services/api/client';
import { Endpoints } from '@/services/api/endpoints';
import { mockOrders } from '@/services/mock/orders.mock';
import type { ApiResponse, CartItem, Order, OrderStatus, Paginated, ShippingAddress } from '@/types';
import { mockLatency, paginate } from '@/utils';

/** Matches the backend's `POST /orders` body — never send full `Product`/`CartSummary`
 * objects, the server snapshots price/name/image and recomputes totals itself. */
export type PlaceOrderInput = {
  items: { productId: string; quantity: number; volumeMl?: number }[];
  shippingAddress: ShippingAddress;
  deliveryMethod: 'standard' | 'express';
  paymentMethod: 'card' | 'wallet' | 'cod';
  guestEmail?: string;
  couponCode?: string;
  /** App deep link Stripe returns to after card/wallet payment (allow-listed by the API). */
  returnUrl?: string;
  /** Generated once per checkout attempt, resent unchanged on retry — dedupes
   * a double-submit into a single order server-side. */
  idempotencyKey: string;
};

export type OrdersService = {
  getAll(page?: number, limit?: number, status?: OrderStatus): Promise<Paginated<Order>>;
  /** `guestEmail` lets a guest read the order they placed (`GET /orders/:id?email=`). */
  getById(id: string, guestEmail?: string): Promise<Order>;
  place(input: PlaceOrderInput, cartItems: CartItem[]): Promise<Order>;
};

// In-memory store so newly placed mock orders appear in history this session.
let sessionOrders: Order[] = [...mockOrders];

const makeOrder = (input: PlaceOrderInput, cartItems: CartItem[]): Order => {
  const seq = String(10300 + sessionOrders.length).padStart(5, '0');
  const items = input.items.map((line) => {
    const product = cartItems.find((i) => i.product.id === line.productId)?.product;
    return {
      productId: line.productId,
      productName: product?.name ?? 'Item',
      productImage: product?.images[0] ?? '',
      price: product?.price ?? 0,
      quantity: line.quantity,
      volumeMl: line.volumeMl,
    };
  });
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping =
    (subtotal === 0 || subtotal >= AppConfig.freeShippingThreshold ? 0 : AppConfig.flatShippingFee) +
    (input.deliveryMethod === 'express' ? 30 : 0);
  const discountAmount = input.couponCode ? Math.round(subtotal * 0.1) : 0; // matches mock WELCOME10
  return {
    id: `o-${Date.now()}`,
    reference: `AM-${seq}`,
    placedAt: new Date().toISOString().slice(0, 10),
    status: 'processing',
    paymentStatus: input.paymentMethod === 'cod' ? 'pending' : 'processing',
    items,
    subtotal,
    shipping,
    total: subtotal + shipping - discountAmount,
    currency: AppConfig.defaultCurrency,
    shippingAddress: input.shippingAddress,
    deliveryMethod: input.deliveryMethod,
    paymentMethod: input.paymentMethod,
    couponCode: input.couponCode,
    discountAmount,
  };
};

const mockService: OrdersService = {
  async getAll(page, limit, status) {
    await mockLatency();
    return paginate(status ? sessionOrders.filter((o) => o.status === status) : sessionOrders, page, limit);
  },
  async getById(id) {
    await mockLatency();
    const order = sessionOrders.find((o) => o.id === id);
    if (!order) throw new Error('Order not found');
    return order;
  },
  async place(input, cartItems) {
    await mockLatency(400, 900);
    const order = makeOrder(input, cartItems);
    sessionOrders = [order, ...sessionOrders];
    if (order.paymentStatus === 'processing') {
      setTimeout(() => {
        sessionOrders = sessionOrders.map((o) => (o.id === order.id ? { ...o, paymentStatus: 'paid' } : o));
      }, 2500);
    }
    return order;
  },
};

const remoteService: OrdersService = {
  async getAll(page, limit, status) {
    const { data } = await apiClient.get<ApiResponse<Paginated<Order>>>(Endpoints.orders, {
      params: { page, limit, status },
    });
    return data.data;
  },
  async getById(id, guestEmail) {
    const { data } = await apiClient.get<ApiResponse<Order>>(Endpoints.order(id), {
      params: { email: guestEmail },
    });
    return data.data;
  },
  async place(input) {
    const { data } = await apiClient.post<ApiResponse<Order>>(Endpoints.orders, input);
    return data.data;
  },
};

export const ordersService: OrdersService =
  AppConfig.dataSource === 'remote' ? remoteService : mockService;
