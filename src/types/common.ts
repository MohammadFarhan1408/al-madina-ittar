/** Shared primitive/util types used across domains. */

export type ID = string;

export type Money = number; // minor-unit-free; formatted via utils/format

export type Nullable<T> = T | null;

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
};
