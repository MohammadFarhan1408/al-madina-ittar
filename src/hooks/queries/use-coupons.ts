import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

import { couponsService } from '@/services';
import { useCartStore } from '@/store';

export const useValidateCoupon = () =>
  useMutation({
    mutationFn: ({ code, subtotal }: { code: string; subtotal: number }) =>
      couponsService.validate(code, subtotal),
  });

/**
 * Re-validates the cart's applied coupon whenever the subtotal changes (a code can stop
 * applying — e.g. minimum purchase — after the bag is edited). `discount` is clamped to
 * the subtotal and is 0 unless the server currently says the code is valid.
 */
export const useAppliedCoupon = (subtotal: number) => {
  const code = useCartStore((s) => s.couponCode);
  const query = useQuery({
    queryKey: ['coupon', code, subtotal],
    queryFn: () => couponsService.validate(code!, subtotal),
    enabled: Boolean(code) && subtotal > 0,
    retry: false,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
  const valid = Boolean(code) && query.data?.valid === true && !query.isError;
  return {
    code,
    valid,
    discount: valid ? Math.min(query.data!.discountAmount, subtotal) : 0,
    isChecking: query.isFetching,
    error: query.isError ? query.error : null,
  };
};
