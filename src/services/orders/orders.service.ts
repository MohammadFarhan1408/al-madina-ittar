import { AppConfig } from '@/core/config';
import { apiClient } from '@/services/api/client';
import { Endpoints } from '@/services/api/endpoints';
import { mockOrders } from '@/services/mock/orders.mock';
import type { ApiResponse, CartItem, CartSummary, Order } from '@/types';
import { mockLatency } from '@/utils';

export type PlaceOrderInput = {
  items: CartItem[];
  summary: CartSummary;
  shippingAddress: string;
};

export type OrdersService = {
  getAll(): Promise<Order[]>;
  place(input: PlaceOrderInput): Promise<Order>;
};

// In-memory store so newly placed mock orders appear in history this session.
let sessionOrders: Order[] = [...mockOrders];

const makeOrder = (input: PlaceOrderInput): Order => {
  const seq = String(10300 + sessionOrders.length).padStart(5, '0');
  return {
    id: `o-${Date.now()}`,
    reference: `AM-${seq}`,
    placedAt: new Date().toISOString().slice(0, 10),
    status: 'processing',
    items: input.items,
    summary: input.summary,
    shippingAddress: input.shippingAddress,
  };
};

const mockService: OrdersService = {
  async getAll() {
    await mockLatency();
    return sessionOrders;
  },
  async place(input) {
    await mockLatency(400, 900);
    const order = makeOrder(input);
    sessionOrders = [order, ...sessionOrders];
    return order;
  },
};

const remoteService: OrdersService = {
  async getAll() {
    const { data } = await apiClient.get<ApiResponse<Order[]>>(Endpoints.orders);
    return data.data;
  },
  async place(input) {
    const { data } = await apiClient.post<ApiResponse<Order>>(Endpoints.orders, input);
    return data.data;
  },
};

export const ordersService: OrdersService =
  AppConfig.dataSource === 'remote' ? remoteService : mockService;
