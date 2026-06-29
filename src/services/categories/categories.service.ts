/**
 * Categories service — mock + remote implementations behind one interface.
 */
import { AppConfig } from '@/core/config';
import { apiClient } from '@/services/api/client';
import { Endpoints } from '@/services/api/endpoints';
import { mockCategories } from '@/services/mock/categories.mock';
import type { ApiResponse, Category } from '@/types';
import { mockLatency } from '@/utils';

export type CategoriesService = {
  getAll(): Promise<Category[]>;
};

const mockService: CategoriesService = {
  async getAll() {
    await mockLatency();
    return mockCategories;
  },
};

const remoteService: CategoriesService = {
  async getAll() {
    const { data } = await apiClient.get<ApiResponse<Category[]>>(Endpoints.categories);
    return data.data;
  },
};

export const categoriesService: CategoriesService =
  AppConfig.dataSource === 'remote' ? remoteService : mockService;
