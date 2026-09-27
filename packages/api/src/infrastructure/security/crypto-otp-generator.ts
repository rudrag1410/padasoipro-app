import { randomInt } from 'node:crypto';
import type { IOtpGenerator } from '../../interfaces';

/** Uniformly random numeric code from the OS CSPRNG. Leading zeros are kept. */
export class CryptoOtpGenerator implements IOtpGenerator {
  generate(length: number): string {
    return randomInt(0, 10 ** length).toString().padStart(length, '0');
  }
}
