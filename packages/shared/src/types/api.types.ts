import type { ErrorCode } from '../constants/error-codes.constants';
import type { CategoryWithTasks, Task } from './task.types';
import type { User } from './user.types';

export interface ApiErrorBody {
  error: {
    code: ErrorCode;
    message: string;
    /** Field name -> first validation message for that field. */
    fieldErrors?: Record<string, string>;
    /** Extra machine-readable context, e.g. OTP timing. */
    meta?: Record<string, unknown>;
  };
}

/** Timing of the current email code, so the app can run its countdowns. */
export interface OtpChallenge {
  email: string;
  expiresAt: string;
  resendAvailableAt: string;
}

export interface RegisterResponse {
  message: string;
  otp: OtpChallenge;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: User;
}

export interface MeResponse {
  user: User;
}

export interface CatalogueResponse {
  categories: CategoryWithTasks[];
}

export interface MyTasksResponse {
  tasks: Task[];
}

export interface ResendOtpResponse {
  message: string;
  otp: OtpChallenge;
}
