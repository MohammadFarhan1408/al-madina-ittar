import { useQuery } from '@tanstack/react-query';

import { collectionsService } from '@/services';
import { QueryKeys } from './query-keys';

export const useCollections = () =>
  useQuery({
    queryKey: QueryKeys.collections,
    queryFn: () => collectionsService.getAll(),
    staleTime: 1000 * 60 * 10,
  });
