/**
 * Cart service — the backend cart (`requireAuth`) always returns a server-reconciled
 * cart (fresh price/name/image, drops out-of-stock/missing lines); callers must replace
 * local state with the response rather than merge. Does not include the express-
 * delivery surcharge (that's computed at order-creation from `deliveryMethod`).
 */
import { AppConfig } from '@/core/config';
import { apiClient } from '@/services/api/client';
import { Endpoints } from '@/services/api/endpoints';
import type { ApiResponse } from '@/types';
import { mockLatency } from '@/utils';

export type ReconciledCartLine = {
  productId: string;
  quantity: number;
  volumeMl?: number;
  price: number;
  name: string;
  image: string;
};

export type ReconciledCart = {
  items: ReconciledCartLine[];
  subtotal: number;
  shipping: number;
  total: number;
};

export type SyncCartItem = { productId: string; quantity: number; volumeMl?: number };

export type CartService = {
  get(): Promise<ReconciledCart>;
  sync(items: SyncCartItem[]): Promise<ReconciledCart>;
  addItem(productId: string, quantity: number, volumeMl?: number): Promise<ReconciledCart>;
  setQuantity(productId: string, quantity: number): Promise<ReconciledCart>;
  removeItem(productId: string): Promise<ReconciledCart>;
};

let mockCart: SyncCartItem[] = [];

const emptyReconciled: ReconciledCart = { items: [], subtotal: 0, shipping: 0, total: 0 };

const mockService: CartService = {
  async get() {
    await mockLatency();
    return emptyReconciled;
  },
  async sync(items) {
    await mockLatency();
    mockCart = items;
    return emptyReconciled;
  },
  async addItem(productId, quantity) {
    await mockLatency();
    const existing = mockCart.find((i) => i.productId === productId);
    mockCart = existing
      ? mockCart.map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i))
      : [...mockCart, { productId, quantity }];
    return emptyReconciled;
  },
  async setQuantity(productId, quantity) {
    await mockLatency();
    mockCart =
      quantity <= 0
        ? mockCart.filter((i) => i.productId !== productId)
        : mockCart.map((i) => (i.productId === productId ? { ...i, quantity } : i));
    return emptyReconciled;
  },
  async removeItem(productId) {
    await mockLatency();
    mockCart = mockCart.filter((i) => i.productId !== productId);
    return emptyReconciled;
  },
};

const remoteService: CartService = {
  async get() {
    const { data } = await apiClient.get<ApiResponse<ReconciledCart>>(Endpoints.cart.get);
    return data.data;
  },
  async sync(items) {
    const { data } = await apiClient.post<ApiResponse<ReconciledCart>>(Endpoints.cart.sync, { items });
    return data.data;
  },
  async addItem(productId, quantity, volumeMl) {
    const { data } = await apiClient.post<ApiResponse<ReconciledCart>>(Endpoints.cart.addItem, {
      productId,
      quantity,
      volumeMl,
    });
    return data.data;
  },
  async setQuantity(productId, quantity) {
    const { data } = await apiClient.patch<ApiResponse<ReconciledCart>>(
      Endpoints.cart.item(productId),
      { quantity },
    );
    return data.data;
  },
  async removeItem(productId) {
    const { data } = await apiClient.delete<ApiResponse<ReconciledCart>>(
      Endpoints.cart.item(productId),
    );
    return data.data;
  },
};

export const cartService: CartService =
  AppConfig.dataSource === 'remote' ? remoteService : mockService;
