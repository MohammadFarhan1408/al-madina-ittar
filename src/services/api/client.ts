/**
 * Axios instance with interceptors. Used by the 'remote' data source. Requests are
 * bearer-authenticated from SecureStore; a 401 triggers a single in-flight token
 * refresh (shared across concurrent requests) before retrying once. Error responses
 * are normalized to `ApiError` so callers handle a single shape.
 */
import { AxiosError, create, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

import { AppConfig } from '@/core/config';
import type { ApiError, ApiResponse } from '@/types';
import { Endpoints } from './endpoints';
import { tokenStorage } from './token-storage';

export const apiClient: AxiosInstance = create({
  baseURL: AppConfig.apiBaseUrl,
  timeout: AppConfig.apiTimeoutMs,
  headers: { 'Content-Type': 'application/json' },
});

// Bare instance for refresh calls — must not carry the request/response interceptors
// below, or a failed refresh would recursively trigger another refresh.
const refreshClient: AxiosInstance = create({
  baseURL: AppConfig.apiBaseUrl,
  timeout: AppConfig.apiTimeoutMs,
  headers: { 'Content-Type': 'application/json' },
});

/** Registered by the session store at app boot; avoids a circular import here. */
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

apiClient.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getAccessToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

const isAuthRequest = (url?: string) =>
  Boolean(url && Object.values(Endpoints.auth).includes(url as (typeof Endpoints.auth)[keyof typeof Endpoints.auth]));

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const refreshToken = await tokenStorage.getRefreshToken();
        if (!refreshToken) return null;
        const { data } = await refreshClient.post<
          ApiResponse<{ accessToken: string; refreshToken: string; refreshExpiresAt?: string }>
        >(Endpoints.auth.refresh, { refreshToken });
        await tokenStorage.setTokens(data.data);
        return data.data.accessToken;
      } catch {
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
};

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
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    // A deactivated account can't be fixed by refreshing — surface the error as-is.
    const code = (error.response?.data as { code?: string } | undefined)?.code;
    if (
      error.response?.status === 401 &&
      code !== 'ACCOUNT_INACTIVE' &&
      original &&
      !original._retry &&
      !isAuthRequest(original.url)
    ) {
      original._retry = true;
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        original.headers.set('Authorization', `Bearer ${newAccessToken}`);
        return apiClient.request(original);
      }
      await tokenStorage.clear();
      onUnauthorized?.();
    }

    return Promise.reject(normalizeError(error));
  },
);
