/**
 * Contact form (`POST /contact`) and newsletter signup (`POST /newsletter`) — both
 * public, rate-limited on the backend (3/hr and 5/hr), both reply with `data: null`.
 */
import { AppConfig } from '@/core/config';
import { apiClient } from '@/services/api/client';
import { Endpoints } from '@/services/api/endpoints';
import type { ApiResponse } from '@/types';
import { mockLatency } from '@/utils';

export type ContactInput = { name: string; email: string; message: string };

export type ContactService = {
  send(input: ContactInput): Promise<void>;
  subscribe(email: string): Promise<void>;
};

const mockService: ContactService = {
  async send() {
    await mockLatency();
  },
  async subscribe() {
    await mockLatency();
  },
};

const remoteService: ContactService = {
  async send(input) {
    await apiClient.post<ApiResponse<null>>(Endpoints.contact, input);
  },
  async subscribe(email) {
    await apiClient.post<ApiResponse<null>>(Endpoints.newsletter, { email });
  },
};

export const contactService: ContactService =
  AppConfig.dataSource === 'remote' ? remoteService : mockService;
