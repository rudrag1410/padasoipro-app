import type { AuthContext } from './auth.types';

declare global {
  namespace Express {
    interface Request {
      /** Set by the authenticate middleware. */
      auth?: AuthContext;
    }
  }
}

export {};
