import { useQuery } from '@tanstack/react-query';

import { productsService } from '@/services';
import { QueryKeys } from './query-keys';

const FIVE_MIN = 1000 * 60 * 5;

export const useProducts = () =>
  useQuery({
    queryKey: QueryKeys.products,
    queryFn: () => productsService.getAll(),
    staleTime: FIVE_MIN,
  });

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

export const useSearchProducts = (query: string) =>
  useQuery({
    queryKey: QueryKeys.search(query),
    queryFn: () => productsService.search(query),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 30,
  });

export const useProduct = (id: string) =>
  useQuery({
    queryKey: QueryKeys.product(id),
    queryFn: () => productsService.getById(id),
    enabled: Boolean(id),
    staleTime: FIVE_MIN,
  });

export const useProductsByCategory = (categoryId: string) =>
  useQuery({
    queryKey: QueryKeys.productsByCategory(categoryId),
    queryFn: () => productsService.getByCategory(categoryId),
    enabled: Boolean(categoryId),
    staleTime: FIVE_MIN,
  });
