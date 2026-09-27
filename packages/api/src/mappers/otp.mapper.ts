import type { OtpChallenge } from '@padosipro/shared';
import type { OtpRecord } from '../types';
import { addSeconds, toIso } from '../utils';

export function toOtpChallenge(email: string, otp: Pick<OtpRecord, 'createdAt' | 'expiresAt'>, cooldownSeconds: number): OtpChallenge {
  return {
    email,
    expiresAt: toIso(otp.expiresAt),
    resendAvailableAt: toIso(addSeconds(otp.createdAt, cooldownSeconds)),
  };
}
