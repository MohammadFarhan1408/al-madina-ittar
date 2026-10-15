import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { productsService, type CreateReviewInput, type ProductListParams } from '@/services';
import { QueryKeys } from './query-keys';

const FIVE_MIN = 1000 * 60 * 5;
const PAGE_SIZE = 20;

/** Flattens `useInfiniteQuery`'s pages into a single array for FlashList consumption. */
function useFlatInfiniteProducts(
  queryKey: readonly unknown[],
  fetchPage: (page: number) => ReturnType<typeof productsService.getAll>,
  enabled = true,
) {
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    enabled,
    staleTime: FIVE_MIN,
  });
  const data = useMemo(() => query.data?.pages.flatMap((p) => p.items) ?? [], [query.data]);
  return { ...query, data };
}

export const useProducts = (params?: ProductListParams, enabled = true) =>
  useFlatInfiniteProducts(
    [...QueryKeys.products, params] as const,
    (page) => productsService.getAll({ ...params, page, limit: PAGE_SIZE }),
    enabled,
  );

export const useFeaturedProducts = () =>
  useQuery({
    queryKey: QueryKeys.featuredProducts,
    queryFn: () => productsService.getFeatured(),
    staleTime: FIVE_MIN,
  });

export const useNewArrivals = () =>
  useQuery({
    queryKey: QueryKeys.newArrivals,
    queryFn: () => productsService.getNewArrivals(),
    staleTime: FIVE_MIN,
  });

export const useBestSellers = () =>
  useQuery({
    queryKey: QueryKeys.bestSellers,
    queryFn: () => productsService.getBestSellers(),
    staleTime: FIVE_MIN,
  });

export const useSignature = () =>
  useQuery({
    queryKey: QueryKeys.signature,
    queryFn: () => productsService.getSignature(),
    staleTime: FIVE_MIN,
  });

export const useSeasonal = () =>
  useQuery({
    queryKey: QueryKeys.seasonal,
    queryFn: () => productsService.getSeasonal(),
    staleTime: FIVE_MIN,
  });

export const useProductsByIds = (ids: string[]) =>
  useQuery({
    queryKey: QueryKeys.productsByIds(ids),
    queryFn: () => productsService.getByIds(ids),
    enabled: ids.length > 0,
    staleTime: FIVE_MIN,
  });

export const useProductReviews = (productId: string) =>
  useQuery({
    queryKey: QueryKeys.productReviews(productId),
    queryFn: () => productsService.getReviews(productId),
    enabled: Boolean(productId),
    staleTime: FIVE_MIN,
  });

export const useCreateReview = (productId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReviewInput) => productsService.createReview(productId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.productReviews(productId) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.product(productId) });
    },
  });
};

export const useSearchProducts = (query: string, params?: ProductListParams) =>
  useFlatInfiniteProducts(
    [...QueryKeys.search(query), params] as const,
    (page) => productsService.search(query, { ...params, page, limit: PAGE_SIZE }),
    query.trim().length > 0,
  );

export const useSearchSuggestions = (query: string) => {
  const q = query.trim();
  return useQuery({
    queryKey: QueryKeys.suggest(q),
    queryFn: () => productsService.suggest(q),
    enabled: q.length >= 2,
    staleTime: 60_000,
    retry: false,
  });
};

export const useTrendingSearches = () =>
  useQuery({
    queryKey: QueryKeys.trending,
    queryFn: () => productsService.trending(),
    staleTime: 1000 * 60 * 60,
  });

/** Latest reviews across the top best-sellers (the backend only exposes per-product reviews). */
export const useHomeReviews = () => {
  const { data: bestSellers } = useBestSellers();
  const top = (bestSellers ?? []).slice(0, 3);
  return useQuery({
    queryKey: [...QueryKeys.homeReviews, top.map((p) => p.id).join(',')],
    queryFn: async () => {
      const pages = await Promise.all(top.map((p) => productsService.getReviews(p.id, 1, 3)));
      return pages.flatMap((r) => r.items);
    },
    enabled: top.length > 0,
    staleTime: FIVE_MIN,
  });
};

export const useProduct = (id: string) =>
  useQuery({
    queryKey: QueryKeys.product(id),
    queryFn: () => productsService.getById(id),
    enabled: Boolean(id),
    staleTime: FIVE_MIN,
  });

export const useProductsByCategory = (categoryId: string, params?: ProductListParams) =>
  useFlatInfiniteProducts(
    [...QueryKeys.productsByCategory(categoryId), params] as const,
    (page) => productsService.getByCategory(categoryId, { ...params, page, limit: PAGE_SIZE }),
    Boolean(categoryId),
  );
