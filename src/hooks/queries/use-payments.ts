import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { paymentsService } from '@/services';
import { openCheckoutUrl, paymentReturnUrl } from '@/services/payments/checkout-browser';
import { QueryKeys } from './query-keys';

export const useOrderPayments = (orderId: string, guestEmail?: string) =>
  useQuery({
    queryKey: QueryKeys.orderPayments(orderId),
    queryFn: () => paymentsService.getForOrder(orderId, guestEmail),
    enabled: Boolean(orderId),
    staleTime: 1000 * 10,
  });

/** Creates a new payment attempt and, for Stripe, opens its Checkout in the in-app browser. */
export const useRetryPayment = (orderId: string, guestEmail?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (idempotencyKey: string) => {
      const transaction = await paymentsService.retry(orderId, idempotencyKey, guestEmail, paymentReturnUrl());
      if (transaction.metadata?.checkoutUrl) await openCheckoutUrl(transaction.metadata.checkoutUrl);
      return transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.orderPayments(orderId) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.order(orderId) });
    },
  });
};
