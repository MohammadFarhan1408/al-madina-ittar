import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { addressesService } from '@/services';
import type { AddressInput } from '@/types';
import { QueryKeys } from './query-keys';

// `GET /addresses` is requireAuth on the backend — pass `enabled: false` for guests.
export const useAddresses = (enabled = true) =>
  useQuery({
    queryKey: QueryKeys.addresses,
    queryFn: () => addressesService.getAll(),
    enabled,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddressInput) => addressesService.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QueryKeys.addresses }),
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<AddressInput> }) =>
      addressesService.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QueryKeys.addresses }),
  });
};

export const useRemoveAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressesService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QueryKeys.addresses }),
  });
};
