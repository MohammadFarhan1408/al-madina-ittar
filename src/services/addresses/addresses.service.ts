import { AppConfig } from '@/core/config';
import { apiClient } from '@/services/api/client';
import { Endpoints } from '@/services/api/endpoints';
import type { Address, AddressInput, ApiResponse } from '@/types';
import { mockLatency } from '@/utils';

export type AddressesService = {
  getAll(): Promise<Address[]>;
  create(input: AddressInput): Promise<Address>;
  update(id: string, input: Partial<AddressInput>): Promise<Address>;
  remove(id: string): Promise<void>;
};

let mockAddresses: Address[] = [];

const mockService: AddressesService = {
  async getAll() {
    await mockLatency();
    return mockAddresses;
  },
  async create(input) {
    await mockLatency();
    if (input.isDefault) mockAddresses = mockAddresses.map((a) => ({ ...a, isDefault: false }));
    const address: Address = { id: `addr-${Date.now()}`, ...input };
    mockAddresses = [address, ...mockAddresses];
    return address;
  },
  async update(id, input) {
    await mockLatency();
    if (input.isDefault) mockAddresses = mockAddresses.map((a) => ({ ...a, isDefault: false }));
    mockAddresses = mockAddresses.map((a) => (a.id === id ? { ...a, ...input } : a));
    return mockAddresses.find((a) => a.id === id)!;
  },
  async remove(id) {
    await mockLatency();
    mockAddresses = mockAddresses.filter((a) => a.id !== id);
  },
};

const remoteService: AddressesService = {
  async getAll() {
    const { data } = await apiClient.get<ApiResponse<Address[]>>(Endpoints.addresses.list);
    return data.data;
  },
  async create(input) {
    const { data } = await apiClient.post<ApiResponse<Address>>(Endpoints.addresses.create, input);
    return data.data;
  },
  async update(id, input) {
    const { data } = await apiClient.patch<ApiResponse<Address>>(Endpoints.addresses.update(id), input);
    return data.data;
  },
  async remove(id) {
    await apiClient.delete<ApiResponse<null>>(Endpoints.addresses.remove(id));
  },
};

export const addressesService: AddressesService =
  AppConfig.dataSource === 'remote' ? remoteService : mockService;
