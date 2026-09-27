import { createHmac, timingSafeEqual } from 'node:crypto';
import type { IOtpHasher } from '../../interfaces';

/**
 * HMAC-SHA256 with a server-side secret. A plain SHA hash of a 6-digit code could be reversed
 * by trying all million values; without the secret, a leaked table reveals nothing.
 */
export class HmacOtpHasher implements IOtpHasher {
  constructor(private readonly secret: string) {}

  hash(code: string): string {
    return createHmac('sha256', this.secret).update(code).digest('hex');
  }

  matches(code: string, hash: string): boolean {
    const expected = Buffer.from(hash, 'hex');
    const actual = Buffer.from(this.hash(code), 'hex');
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }
}
