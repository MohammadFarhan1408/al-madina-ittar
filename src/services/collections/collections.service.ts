import { AppConfig } from '@/core/config';
import { apiClient } from '@/services/api/client';
import { Endpoints } from '@/services/api/endpoints';
import { mockCollections } from '@/services/mock/collections.mock';
import type { ApiResponse, Collection } from '@/types';
import { mockLatency } from '@/utils';

export type CollectionsService = {
  getAll(): Promise<Collection[]>;
};

const mockService: CollectionsService = {
  async getAll() {
    await mockLatency();
    return mockCollections;
  },
};

const remoteService: CollectionsService = {
  async getAll() {
    const { data } = await apiClient.get<ApiResponse<Collection[]>>(Endpoints.collections);
    return data.data;
  },
};

export const collectionsService: CollectionsService =
  AppConfig.dataSource === 'remote' ? remoteService : mockService;
