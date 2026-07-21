import { useMutation } from '@tanstack/react-query';

import { couponsService } from '@/services';

export const useValidateCoupon = () =>
  useMutation({
    mutationFn: ({ code, subtotal }: { code: string; subtotal: number }) =>
      couponsService.validate(code, subtotal),
  });
