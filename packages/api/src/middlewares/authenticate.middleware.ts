import type { RequestHandler } from 'express';
import { BEARER_PREFIX } from '../constants';
import { AppError } from '../errors';
import type { ITokenService } from '../interfaces';

export function authenticate(tokens: ITokenService): RequestHandler {
  return (req, _res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith(BEARER_PREFIX)) return next(AppError.unauthorized());

    const payload = tokens.verify(header.slice(BEARER_PREFIX.length).trim());
    if (!payload) return next(AppError.unauthorized('Your session has expired. Please log in again.'));

    req.auth = { userId: payload.sub };
    next();
  };
}
