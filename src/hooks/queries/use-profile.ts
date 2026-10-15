import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { authService } from '@/services';
import { useSessionStore } from '@/store';
import type { UserPreferences } from '@/types';
import { QueryKeys } from './query-keys';

/** `GET /users/me/preferences` — hydrates the settings switches for a signed-in user. */
export const usePreferences = () => {
  const userId = useSessionStore((s) => s.user?.id);
  return useQuery({
    queryKey: QueryKeys.preferences(userId),
    queryFn: () => authService.getPreferences(),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5,
  });
};

/** Optimistic: the switch flips immediately and rolls back if the PATCH fails. */
export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();
  const userId = useSessionStore((s) => s.user?.id);
  const key = QueryKeys.preferences(userId);
  return useMutation({
    mutationFn: (input: Partial<UserPreferences>) => authService.updatePreferences(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<UserPreferences>(key);
      if (previous) queryClient.setQueryData<UserPreferences>(key, { ...previous, ...input });
      return { previous };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(key, ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
};
