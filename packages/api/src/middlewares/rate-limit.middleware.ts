import { ERROR_CODES, type ApiErrorBody } from '@padosipro/shared';
import rateLimit from 'express-rate-limit';
import { AUTH_RATE_LIMIT_WINDOW_MS, HTTP_STATUS } from '../constants';

/** Coarse per-IP limit on auth endpoints, on top of the per-account OTP rules. */
export function authRateLimit(max: number) {
  return rateLimit({
    windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
    limit: max,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, res) => {
      const body: ApiErrorBody = {
        error: { code: ERROR_CODES.RATE_LIMITED, message: 'Too many requests. Please wait a few minutes and try again.' },
      };
      res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json(body);
    },
  });
}
