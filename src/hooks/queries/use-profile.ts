import { useMutation } from '@tanstack/react-query';

import { authService } from '@/services';
import type { UserPreferences } from '@/types';

/**
 * The backend only exposes `PATCH /users/me/preferences` (no GET), so there's nothing
 * to hydrate from on load — this mutation is write-only, matching what the API
 * actually supports today.
 */
export const useUpdatePreferences = () =>
  useMutation({
    mutationFn: (input: Partial<UserPreferences>) => authService.updatePreferences(input),
  });
