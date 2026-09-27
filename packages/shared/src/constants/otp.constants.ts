/** Rules for the email one-time password. Shared so the app can show the same numbers the server enforces. */
export const OTP_RULES = {
  LENGTH: 6,
  TTL_SECONDS: 10 * 60,
  MAX_ATTEMPTS: 5,
  RESEND_COOLDOWN_SECONDS: 30,
} as const;
