import { ERROR_CODES, type ApiErrorBody } from '@padosipro/shared';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import { HTTP_STATUS } from '../constants';
import { AppError } from '../errors';
import type { ILogger } from '../interfaces';

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(AppError.notFound(`Route ${req.method} ${req.path} not found`));
};

/** Every error leaves the API in the same `{ error: { code, message, ... } }` shape. */
export function errorHandler(logger: ILogger): ErrorRequestHandler {
  return (err, _req, res, _next) => {
    if (err instanceof AppError) {
      const body: ApiErrorBody = {
        error: { code: err.code, message: err.message, fieldErrors: err.fieldErrors, meta: err.meta },
      };
      res.status(err.status).json(body);
      return;
    }

    // body-parser errors carry a `type`; treat them as client mistakes.
    if (err?.type === 'entity.parse.failed' || err?.type === 'entity.too.large') {
      const body: ApiErrorBody = {
        error: {
          code: ERROR_CODES.VALIDATION_FAILED,
          message: err.type === 'entity.too.large' ? 'Request body is too large' : 'Request body must be valid JSON',
        },
      };
      res.status(HTTP_STATUS.BAD_REQUEST).json(body);
      return;
    }

    logger.error({ err }, 'Unhandled error');
    const body: ApiErrorBody = {
      error: { code: ERROR_CODES.INTERNAL_ERROR, message: 'Something went wrong on our side. Please try again.' },
    };
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(body);
  };
}
