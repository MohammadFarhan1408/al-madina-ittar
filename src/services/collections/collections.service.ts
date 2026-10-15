import { AppConfig } from '@/core/config';
import { apiClient } from '@/services/api/client';
import { Endpoints } from '@/services/api/endpoints';
import { mockCollections } from '@/services/mock/collections.mock';
import { mockProducts } from '@/services/mock/products.mock';
import type { ApiResponse, Collection, Product } from '@/types';
import { mockLatency } from '@/utils';

export type CollectionsService = {
  getAll(): Promise<Collection[]>;
  /** Curated order, not paginated (`/collections/:id/products` returns a bare array). */
  getProducts(id: string): Promise<Product[]>;
};

const mockService: CollectionsService = {
  async getAll() {
    await mockLatency();
    return mockCollections;
  },
  async getProducts() {
    await mockLatency();
    return mockProducts;
  },
};

const remoteService: CollectionsService = {
  async getAll() {
    const { data } = await apiClient.get<ApiResponse<Collection[]>>(Endpoints.collections);
    return data.data;
  },
  async getProducts(id) {
    const { data } = await apiClient.get<ApiResponse<Product[]>>(Endpoints.collectionProducts(id));
    return data.data;
  },
};

export const collectionsService: CollectionsService =
  AppConfig.dataSource === 'remote' ? remoteService : mockService;
