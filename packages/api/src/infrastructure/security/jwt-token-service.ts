import jwt from 'jsonwebtoken';
import { JWT_ALGORITHM, JWT_ISSUER } from '../../constants';
import type { IClock, ITokenService } from '../../interfaces';
import type { IssuedToken, TokenPayload } from '../../types';
import { addSeconds } from '../../utils';

export class JwtTokenService implements ITokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresInSeconds: number,
    private readonly clock: IClock,
  ) {}

  issue(payload: TokenPayload): IssuedToken {
    const now = this.clock.now();
    const iat = Math.floor(now.getTime() / 1000);
    const token = jwt.sign({ sub: payload.sub, iat, exp: iat + this.expiresInSeconds }, this.secret, {
      algorithm: JWT_ALGORITHM,
      issuer: JWT_ISSUER,
    });
    return { token, expiresAt: addSeconds(new Date(iat * 1000), this.expiresInSeconds) };
  }

  verify(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret, {
        algorithms: [JWT_ALGORITHM],
        issuer: JWT_ISSUER,
        clockTimestamp: Math.floor(this.clock.now().getTime() / 1000),
      });
      if (typeof decoded === 'string' || typeof decoded.sub !== 'string') return null;
      return { sub: decoded.sub };
    } catch {
      return null;
    }
  }
}
