import { AppConfig } from '@/core/config';
import { apiClient } from '@/services/api/client';
import { Endpoints } from '@/services/api/endpoints';
import { mockNotifications } from '@/services/mock/notifications.mock';
import type { AppNotification, ApiResponse, Paginated } from '@/types';
import { mockLatency, paginate } from '@/utils';

export type NotificationsService = {
  getAll(page?: number, limit?: number): Promise<Paginated<AppNotification>>;
  markRead(id: string): Promise<AppNotification>;
  markAllRead(): Promise<void>;
};

// Mutated in place so mock mode reflects read-state across refetches this session.
const mockList: AppNotification[] = mockNotifications;

const mockService: NotificationsService = {
  async getAll(page, limit) {
    await mockLatency();
    return paginate(mockList, page, limit);
  },
  async markRead(id) {
    await mockLatency();
    const notification = mockList.find((n) => n.id === id);
    if (notification) notification.read = true;
    return notification!;
  },
  async markAllRead() {
    await mockLatency();
    mockList.forEach((n) => {
      n.read = true;
    });
  },
};

const remoteService: NotificationsService = {
  async getAll(page, limit) {
    const { data } = await apiClient.get<ApiResponse<Paginated<AppNotification>>>(
      Endpoints.notifications,
      { params: { page, limit } },
    );
    return data.data;
  },
  async markRead(id) {
    const { data } = await apiClient.patch<ApiResponse<AppNotification>>(
      Endpoints.notificationRead(id),
    );
    return data.data;
  },
  async markAllRead() {
    await apiClient.patch<ApiResponse<null>>(Endpoints.notificationsReadAll);
  },
};

export const notificationsService: NotificationsService =
  AppConfig.dataSource === 'remote' ? remoteService : mockService;
