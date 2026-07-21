import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { notificationsService } from '@/services';
import { QueryKeys } from './query-keys';

export const useNotifications = (page = 1, limit = 20) =>
  useQuery({
    queryKey: [...QueryKeys.notifications, page] as const,
    queryFn: () => notificationsService.getAll(page, limit),
    staleTime: 1000 * 60,
  });

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QueryKeys.notifications }),
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QueryKeys.notifications }),
  });
};
