import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { useMemo } from 'react';

import { notificationsService } from '@/services';
import { useSessionStore } from '@/store';
import type { AppNotification, Paginated } from '@/types';
import { QueryKeys } from './query-keys';

type NotificationPages = InfiniteData<Paginated<AppNotification>>;

// `GET /notifications` is requireAuth on the backend — guests have none.
export const useNotifications = (limit = 20) => {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const query = useInfiniteQuery({
    queryKey: [...QueryKeys.notifications, 'list'] as const,
    queryFn: ({ pageParam }) => notificationsService.getAll(pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    enabled: isAuthenticated,
    staleTime: 1000 * 60,
  });
  const items = useMemo(() => query.data?.pages.flatMap((p) => p.items) ?? [], [query.data]);
  return { ...query, items };
};

/** Marks one (`id`) or every (`null`) cached notification read, across all pages. */
const markReadInCache = (data: NotificationPages | undefined, id: string | null) =>
  data && {
    ...data,
    pages: data.pages.map((p) => ({
      ...p,
      items: p.items.map((n) => (id === null || n.id === id ? { ...n, read: true } : n)),
    })),
  };

function useOptimisticRead<TVars>(mutationFn: (v: TVars) => Promise<unknown>, idOf: (v: TVars) => string | null) {
  const queryClient = useQueryClient();
  const key = [...QueryKeys.notifications, 'list'] as const;
  return useMutation({
    mutationFn,
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<NotificationPages>(key);
      queryClient.setQueryData<NotificationPages>(key, (old) => markReadInCache(old, idOf(vars)));
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(key, ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: QueryKeys.notifications }),
  });
}

export const useMarkNotificationRead = () =>
  useOptimisticRead((id: string) => notificationsService.markRead(id), (id) => id);

export const useMarkAllNotificationsRead = () =>
  useOptimisticRead(() => notificationsService.markAllRead(), () => null);
