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

const POLL_MS = 2000;
const POLL_CAP_MS = 2 * 60 * 1000;

/** True while a card/wallet payment is settling and recent enough to be worth polling. */
export const isSettling = (order?: Order) =>
  order?.paymentStatus === 'processing' && Date.now() - new Date(order.placedAt).getTime() < POLL_CAP_MS;

export const useOrder = (id: string, initialData?: Order, guestEmail?: string) =>
  useQuery({
    queryKey: QueryKeys.order(id),
    queryFn: () => ordersService.getById(id, guestEmail),
    initialData,
    enabled: Boolean(id),
    staleTime: 1000 * 60,
    // Admin status changes don't push a live update to the customer today, so refetch
    // whenever this screen regains focus instead of building polling/websocket infra.
    refetchOnMount: 'always',
    // While a card/wallet payment is still settling, poll briefly instead of
    // making the customer manually refresh to see it land.
    // Capped at 2 minutes from placement (the web does the same); callers show
    // "still confirming" copy after that.
    refetchInterval: (query) => (isSettling(query.state.data) ? POLL_MS : false),
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
