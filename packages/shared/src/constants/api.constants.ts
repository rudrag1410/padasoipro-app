export const API_PREFIX = '/api/v1';

/** Endpoint paths, relative to API_PREFIX. */
export const API_ROUTES = {
  HEALTH: '/health',
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
  },
  ME: {
    ROOT: '/me',
    PROFILE: '/me/profile',
    TASKS: '/me/tasks',
  },
  TASKS: {
    CATALOGUE: '/tasks',
  },
} as const;
