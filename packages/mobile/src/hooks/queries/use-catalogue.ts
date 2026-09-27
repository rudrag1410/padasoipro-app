import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';
import { tasksApi } from '@/services/api';

export function useCatalogue() {
  return useQuery({
    queryKey: QUERY_KEYS.catalogue,
    queryFn: async () => (await tasksApi.getCatalogue()).categories,
    staleTime: 10 * 60_000,
  });
}
