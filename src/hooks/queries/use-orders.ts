import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ordersService, type PlaceOrderInput } from '@/services';
import { useSessionStore } from '@/store';
import type { CartItem, Order } from '@/types';
import { QueryKeys } from './query-keys';

// `GET /orders` (list) is requireAuth on the backend — guests have no order history to fetch.
export const useOrders = (page = 1, limit = 20) => {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: [...QueryKeys.orders, page] as const,
    queryFn: () => ordersService.getAll(page, limit),
    enabled: isAuthenticated,
    staleTime: 1000 * 60,
  });
};

export const useOrder = (id: string, initialData?: Order) =>
  useQuery({
    queryKey: QueryKeys.order(id),
    queryFn: () => ordersService.getById(id),
    initialData,
    enabled: Boolean(id),
    staleTime: 1000 * 60,
    // Admin status changes don't push a live update to the customer today, so refetch
    // whenever this screen regains focus instead of building polling/websocket infra.
    refetchOnMount: 'always',
    // While a card/wallet payment is still settling, poll briefly instead of
    // making the customer manually refresh to see it land.
    refetchInterval: (query) => (query.state.data?.paymentStatus === 'processing' ? 2000 : false),
  });

export const usePlaceOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { input: PlaceOrderInput; cartItems: CartItem[] }) =>
      ordersService.place(args.input, args.cartItems),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.orders });
    },
  });
};
