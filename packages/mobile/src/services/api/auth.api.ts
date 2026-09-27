import {
  API_ROUTES,
  type AuthResponse,
  type LoginInput,
  type RegisterInput,
  type RegisterResponse,
  type ResendOtpResponse,
  type VerifyOtpInput,
} from '@padosipro/shared';
import type { IHttpClient } from '@/types';

export function createAuthApi(http: IHttpClient) {
  return {
    register: (body: RegisterInput) =>
      http.request<RegisterResponse>(API_ROUTES.AUTH.REGISTER, { method: 'POST', body, anonymous: true }),
    login: (body: LoginInput) => http.request<AuthResponse>(API_ROUTES.AUTH.LOGIN, { method: 'POST', body, anonymous: true }),
    verifyOtp: (body: VerifyOtpInput) =>
      http.request<AuthResponse>(API_ROUTES.AUTH.VERIFY_OTP, { method: 'POST', body, anonymous: true }),
    resendOtp: (email: string) =>
      http.request<ResendOtpResponse>(API_ROUTES.AUTH.RESEND_OTP, { method: 'POST', body: { email }, anonymous: true }),
  };
}

export type AuthApi = ReturnType<typeof createAuthApi>;
