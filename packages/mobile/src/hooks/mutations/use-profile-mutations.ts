import type { ProfileInput } from '@padosipro/shared';
import { useMutation } from '@tanstack/react-query';
import { meApi } from '@/services/api';
import { useAuth } from '../use-auth';

export function useSaveProfile() {
  const { updateUser } = useAuth();
  return useMutation({
    mutationFn: (input: ProfileInput) => meApi.saveProfile(input),
    onSuccess: ({ user }) => updateUser(user),
  });
}
