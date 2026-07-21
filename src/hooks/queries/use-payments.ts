import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { paymentsService } from '@/services';
import { QueryKeys } from './query-keys';

export const useOrderPayments = (orderId: string) =>
  useQuery({
    queryKey: QueryKeys.orderPayments(orderId),
    queryFn: () => paymentsService.getForOrder(orderId),
    enabled: Boolean(orderId),
    staleTime: 1000 * 10,
  });

export const useRetryPayment = (orderId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idempotencyKey: string) => paymentsService.retry(orderId, idempotencyKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.orderPayments(orderId) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.order(orderId) });
    },
  });
};
