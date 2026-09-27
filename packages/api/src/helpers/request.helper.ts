import type { Request } from 'express';
import { AppError } from '../errors';

/** The authenticated user's id. Only valid behind the authenticate middleware. */
export function requireUserId(req: Request): string {
  if (!req.auth) throw AppError.unauthorized();
  return req.auth.userId;
}
