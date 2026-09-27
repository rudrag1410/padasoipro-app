import type { LoginInput, RegisterInput, VerifyOtpInput } from '@padosipro/shared';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/services/api';
import { useAuth } from '../use-auth';

export function useRegister() {
  return useMutation({ mutationFn: (input: RegisterInput) => authApi.register(input) });
}

/** Signs in on success. EMAIL_NOT_VERIFIED is surfaced as an error for the screen to route on. */
export function useLogin() {
  const { signIn } = useAuth();
  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: signIn,
  });
}

export function useVerifyOtp() {
  const { signIn } = useAuth();
  return useMutation({
    mutationFn: (input: VerifyOtpInput) => authApi.verifyOtp(input),
    onSuccess: signIn,
  });
}

export function useResendOtp() {
  return useMutation({ mutationFn: (email: string) => authApi.resendOtp(email) });
}
