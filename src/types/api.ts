/** Normalized API error shape produced by the Axios response interceptor. */
export type ApiError = {
  status: number;
  message: string;
  /** Machine-readable code when the backend provides one. */
  code?: string;
  /** Original payload for debugging. */
  details?: unknown;
};

export type ApiResponse<T> = {
  data: T;
  message?: string;
};
