import type { ApiErrorBody } from '@padosipro/shared';
import type { AppErrorCode } from '@/types';

/** Every failed request becomes one of these, whether the server answered or not. */
export class ApiError extends Error {
  constructor(
    readonly code: AppErrorCode,
    message: string,
    readonly status: number | null = null,
    readonly fieldErrors: Record<string, string> = {},
    readonly meta: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static fromBody(status: number, body: ApiErrorBody): ApiError {
    const { code, message, fieldErrors, meta } = body.error;
    return new ApiError(code, message, status, fieldErrors ?? {}, meta ?? {});
  }

  get isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR' || this.code === 'TIMEOUT';
  }
}

export function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof (value as ApiErrorBody).error?.code === 'string' &&
    typeof (value as ApiErrorBody).error?.message === 'string'
  );
}
