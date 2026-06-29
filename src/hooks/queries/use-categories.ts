import { useQuery } from '@tanstack/react-query';

import { categoriesService } from '@/services';
import { QueryKeys } from './query-keys';

export const useCategories = () =>
  useQuery({
    queryKey: QueryKeys.categories,
    queryFn: () => categoriesService.getAll(),
    staleTime: 1000 * 60 * 10,
  });
