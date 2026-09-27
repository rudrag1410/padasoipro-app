/** Params for the verify screen. Timing comes from the server so the countdown matches its rules. */
export type VerifyParams = {
  email: string;
  expiresAt?: string;
  resendAvailableAt?: string;
  /** Set when the user came from login rather than registration. */
  from?: 'login' | 'register';
};
