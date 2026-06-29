/**
 * Axios instance with interceptors. Used by the 'remote' data source. The auth header
 * is a stub for now; error responses are normalized to `ApiError` so callers handle a
 * single shape.
 */
import { AxiosError, create, type AxiosInstance } from 'axios';

import { AppConfig } from '@/core/config';
import type { ApiError } from '@/types';

export const apiClient: AxiosInstance = create({
  baseURL: AppConfig.apiBaseUrl,
  timeout: AppConfig.apiTimeoutMs,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  // TODO(auth): inject bearer token from secure storage once Auth feature lands.
  return config;
});

const normalizeError = (error: AxiosError): ApiError => {
  if (error.response) {
    const data = error.response.data as { message?: string; code?: string } | undefined;
    return {
      status: error.response.status,
      message: data?.message ?? error.message,
      code: data?.code,
      details: error.response.data,
    };
  }
  return {
    status: 0,
    message: error.message || 'Network error. Please check your connection.',
    code: error.code,
  };
};

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(normalizeError(error)),
);
