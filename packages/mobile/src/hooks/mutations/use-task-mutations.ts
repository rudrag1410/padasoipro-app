import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';
import { meApi } from '@/services/api';
import { useAuth } from '../use-auth';

export function useSaveTasks() {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuth();

  return useMutation({
    mutationFn: (taskIds: string[]) => meApi.saveMyTasks(taskIds),
    onSuccess: async ({ tasks }) => {
      queryClient.setQueryData(QUERY_KEYS.myTasks, tasks);
      if (user && !user.hasSelectedTasks) await updateUser({ ...user, hasSelectedTasks: true });
    },
  });
}
