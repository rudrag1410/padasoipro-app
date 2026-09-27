import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { AppError } from '../errors';
import { toFieldErrors } from '../utils';

/** Parses req.body with the schema and replaces it with the parsed (trimmed, normalised) value. */
export function validateBody(schema: ZodType): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) return next(AppError.validation(toFieldErrors(result.error)));
    req.body = result.data;
    next();
  };
}
