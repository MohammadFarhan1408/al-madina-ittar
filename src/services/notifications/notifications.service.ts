import { AppConfig } from '@/core/config';
import { apiClient } from '@/services/api/client';
import { Endpoints } from '@/services/api/endpoints';
import { mockNotifications } from '@/services/mock/notifications.mock';
import type { AppNotification, ApiResponse } from '@/types';
import { mockLatency } from '@/utils';

export type NotificationsService = {
  getAll(): Promise<AppNotification[]>;
};

const mockService: NotificationsService = {
  async getAll() {
    await mockLatency();
    return mockNotifications;
  },
};

const remoteService: NotificationsService = {
  async getAll() {
    const { data } = await apiClient.get<ApiResponse<AppNotification[]>>(Endpoints.notifications);
    return data.data;
  },
};

export const notificationsService: NotificationsService =
  AppConfig.dataSource === 'remote' ? remoteService : mockService;
