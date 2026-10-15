/**
 * User-facing copy for API failures. Code-specific messages first (the backend's
 * `message` is already human-readable for these), then the backend message, then the
 * caller's fallback. Never surfaces raw axios/network internals.
 */
import type { ApiError } from '@/types';

const isApiError = (e: unknown): e is ApiError =>
  typeof e === 'object' && e !== null && 'status' in e && 'message' in e;

export const getErrorMessage = (err: unknown, fallback: string): string => {
  if (!isApiError(err)) return fallback;
  if (err.status === 0) return 'No connection. Check your network and try again.';
  switch (err.code) {
    case 'ACCOUNT_LOCKED':
      return err.message || 'Too many failed sign-in attempts. Try again in a few minutes.';
    case 'ACCOUNT_INACTIVE':
      return 'This account has been deactivated. Contact support if you think this is a mistake.';
    case 'RATE_LIMITED':
      return 'Too many requests. Please wait a moment and try again.';
  }
  if (err.status >= 500) return fallback;
  return err.message || fallback;
};
