import { ERROR_CODES, type ErrorCode } from '@padosipro/shared';
import { HTTP_STATUS, type HttpStatus } from '../constants';

interface AppErrorOptions {
  fieldErrors?: Record<string, string>;
  meta?: Record<string, unknown>;
}

/** An expected, client-facing failure. Anything else that reaches the error handler is a 500. */
export class AppError extends Error {
  readonly fieldErrors?: Record<string, string>;
  readonly meta?: Record<string, unknown>;

  constructor(
    readonly status: HttpStatus,
    readonly code: ErrorCode,
    message: string,
    options: AppErrorOptions = {},
  ) {
    super(message);
    this.name = 'AppError';
    this.fieldErrors = options.fieldErrors;
    this.meta = options.meta;
  }

  static validation(fieldErrors: Record<string, string>, message = 'Some fields need your attention'): AppError {
    return new AppError(HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_FAILED, message, { fieldErrors });
  }

  static unauthorized(message = 'Please log in to continue'): AppError {
    return new AppError(HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED, message);
  }

  static notFound(message = 'Not found'): AppError {
    return new AppError(HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, message);
  }
}
