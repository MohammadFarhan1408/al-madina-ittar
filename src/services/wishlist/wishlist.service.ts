/**
 * Wishlist service — server-side wishlist is just a set of product IDs (`requireAuth`
 * on the backend); the Zustand `useWishlistStore` remains the reactive local cache the
 * app reads from (see `session-sync.ts` for how the two stay in sync).
 */
import { AppConfig } from '@/core/config';
import { apiClient } from '@/services/api/client';
import { Endpoints } from '@/services/api/endpoints';
import type { ApiResponse } from '@/types';
import { mockLatency } from '@/utils';

export type WishlistService = {
  getIds(): Promise<string[]>;
  add(productId: string): Promise<void>;
  remove(productId: string): Promise<void>;
};

let mockIds: string[] = [];

const mockService: WishlistService = {
  async getIds() {
    await mockLatency();
    return mockIds;
  },
  async add(productId) {
    await mockLatency();
    if (!mockIds.includes(productId)) mockIds = [...mockIds, productId];
  },
  async remove(productId) {
    await mockLatency();
    mockIds = mockIds.filter((id) => id !== productId);
  },
};

const remoteService: WishlistService = {
  async getIds() {
    const { data } = await apiClient.get<ApiResponse<{ productIds: string[] }>>(
      Endpoints.wishlist.list,
    );
    return data.data.productIds;
  },
  async add(productId) {
    try {
      await apiClient.post<ApiResponse<{ productId: string }>>(Endpoints.wishlist.add, {
        productId,
      });
    } catch (err) {
      // Already-saved is not an error from the caller's point of view (409 ALREADY_IN_WISHLIST).
      if ((err as { status?: number }).status !== 409) throw err;
    }
  },
  async remove(productId) {
    try {
      await apiClient.delete<ApiResponse<null>>(Endpoints.wishlist.remove(productId));
    } catch (err) {
      if ((err as { status?: number }).status !== 404) throw err;
    }
  },
};

export const wishlistService: WishlistService =
  AppConfig.dataSource === 'remote' ? remoteService : mockService;
