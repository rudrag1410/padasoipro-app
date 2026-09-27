import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';
import { meApi } from '@/services/api';

export function useMyTasks(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.myTasks,
    queryFn: async () => (await meApi.getMyTasks()).tasks,
    enabled: options.enabled ?? true,
  });
}
