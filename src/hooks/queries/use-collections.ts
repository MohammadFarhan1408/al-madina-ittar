import { useQuery } from '@tanstack/react-query';

import { collectionsService } from '@/services';
import { QueryKeys } from './query-keys';

export const useCollectionProducts = (id: string) =>
  useQuery({
    queryKey: QueryKeys.collectionProducts(id),
    queryFn: () => collectionsService.getProducts(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });

export const useCollections = () =>
  useQuery({
    queryKey: QueryKeys.collections,
    queryFn: () => collectionsService.getAll(),
    staleTime: 1000 * 60 * 10,
  });
