import { useQuery } from '@tanstack/react-query';

import { collectionsService, notificationsService, ordersService } from '@/services';
import { QueryKeys } from './query-keys';

export const useCollections = () =>
  useQuery({
    queryKey: QueryKeys.collections,
    queryFn: () => collectionsService.getAll(),
    staleTime: 1000 * 60 * 10,
  });

export const useOrders = () =>
  useQuery({
    queryKey: QueryKeys.orders,
    queryFn: () => ordersService.getAll(),
    staleTime: 1000 * 60,
  });

export const useNotifications = () =>
  useQuery({
    queryKey: QueryKeys.notifications,
    queryFn: () => notificationsService.getAll(),
    staleTime: 1000 * 60,
  });
