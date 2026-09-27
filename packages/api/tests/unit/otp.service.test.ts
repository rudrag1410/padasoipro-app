import { ERROR_CODES, OTP_RULES } from '@padosipro/shared';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppError } from '../../src/errors';
import { CryptoOtpGenerator } from '../../src/infrastructure/security/crypto-otp-generator';
import { HmacOtpHasher } from '../../src/infrastructure/security/hmac-otp-hasher';
import { OtpService } from '../../src/services/otp.service';
import { FakeClock, InMemoryMailer, InMemoryOtpRepository, SequenceOtpGenerator, silentLogger } from '../support/fakes';

const subject = { id: 'user-1', email: 'asha@example.com' };

/** Runs `fn` and returns the AppError code it threw. */
async function errorCodeOf(fn: () => Promise<unknown>): Promise<string> {
  try {
    await fn();
  } catch (error) {
    if (error instanceof AppError) return error.code;
    throw error;
  }
  throw new Error('Expected an AppError to be thrown');
}

describe('CryptoOtpGenerator', () => {
  it('always produces exactly 6 digits, keeping leading zeros', () => {
    const generator = new CryptoOtpGenerator();
    for (let i = 0; i < 500; i++) {
      expect(generator.generate(6)).toMatch(/^\d{6}$/);
    }
  });
});

describe('HmacOtpHasher', () => {
  const hasher = new HmacOtpHasher('secret-that-is-long-enough-for-hmac-usage');

  it('matches the right code and rejects others', () => {
    const hash = hasher.hash('123456');
    expect(hash).not.toContain('123456');
    expect(hasher.matches('123456', hash)).toBe(true);
    expect(hasher.matches('123457', hash)).toBe(false);
  });

  it('produces different hashes under different secrets', () => {
    const other = new HmacOtpHasher('a-completely-different-secret-value-here');
    expect(other.hash('123456')).not.toBe(hasher.hash('123456'));
  });
});

describe('OtpService', () => {
  let clock: FakeClock;
  let mailer: InMemoryMailer;
  let otps: InMemoryOtpRepository;
  let service: OtpService;

  beforeEach(() => {
    clock = new FakeClock();
    mailer = new InMemoryMailer();
    otps = new InMemoryOtpRepository();
    service = new OtpService({
      otps,
      generator: new SequenceOtpGenerator(['111111', '222222', '333333']),
      hasher: new HmacOtpHasher('secret-that-is-long-enough-for-hmac-usage'),
      mailer,
      clock,
      logger: silentLogger,
    });
  });

  describe('issue', () => {
    it('emails the code, stores only its hash and reports the timing', async () => {
      const challenge = await service.issue(subject);

      expect(mailer.lastCodeFor(subject.email)).toBe('111111');
      expect(otps.records).toHaveLength(1);
      expect(otps.records[0]!.codeHash).not.toContain('111111');
      expect(challenge.expiresAt).toBe(new Date(clock.now().getTime() + OTP_RULES.TTL_SECONDS * 1000).toISOString());
      expect(challenge.resendAvailableAt).toBe(
        new Date(clock.now().getTime() + OTP_RULES.RESEND_COOLDOWN_SECONDS * 1000).toISOString(),
      );
    });

    it('refuses a resend inside the cooldown and says how long to wait', async () => {
      await service.issue(subject);
      clock.advanceSeconds(OTP_RULES.RESEND_COOLDOWN_SECONDS - 10);

      const error = await service.issue(subject).catch((e: AppError) => e);
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe(ERROR_CODES.OTP_RESEND_COOLDOWN);
      expect((error as AppError).meta?.retryAfterSeconds).toBe(10);
      expect(mailer.sent).toHaveLength(1);
    });

    it('allows a resend once the cooldown has passed, and the old code stops working', async () => {
      await service.issue(subject);
      clock.advanceSeconds(OTP_RULES.RESEND_COOLDOWN_SECONDS);
      await service.issue(subject);

      expect(otps.records).toHaveLength(1);
      expect(await errorCodeOf(() => service.verify(subject.id, '111111'))).toBe(ERROR_CODES.OTP_INVALID);
      await expect(service.verify(subject.id, '222222')).resolves.toBeUndefined();
    });

    it('drops the code when the email cannot be sent, so the user can retry straight away', async () => {
      mailer.failNext = true;
      expect(await errorCodeOf(() => service.issue(subject))).toBe(ERROR_CODES.EMAIL_DELIVERY_FAILED);
      expect(otps.records).toHaveLength(0);

      await expect(service.issue(subject)).resolves.toBeDefined();
    });
  });

  describe('verify', () => {
    it('accepts the right code once, and only once', async () => {
      await service.issue(subject);

      await expect(service.verify(subject.id, '111111')).resolves.toBeUndefined();
      expect(await errorCodeOf(() => service.verify(subject.id, '111111'))).toBe(ERROR_CODES.OTP_NOT_FOUND);
    });

    it('fails when no code was ever issued', async () => {
      expect(await errorCodeOf(() => service.verify(subject.id, '111111'))).toBe(ERROR_CODES.OTP_NOT_FOUND);
    });

    it('accepts the code one second before expiry', async () => {
      await service.issue(subject);
      clock.advanceSeconds(OTP_RULES.TTL_SECONDS - 1);
      await expect(service.verify(subject.id, '111111')).resolves.toBeUndefined();
    });

    it('rejects the right code at exactly 10 minutes', async () => {
      await service.issue(subject);
      clock.advanceSeconds(OTP_RULES.TTL_SECONDS);
      expect(await errorCodeOf(() => service.verify(subject.id, '111111'))).toBe(ERROR_CODES.OTP_EXPIRED);
    });

    it('counts down remaining attempts on each wrong code', async () => {
      await service.issue(subject);

      for (let attempt = 1; attempt < OTP_RULES.MAX_ATTEMPTS; attempt++) {
        const error = (await service.verify(subject.id, '999999').catch((e) => e)) as AppError;
        expect(error.code).toBe(ERROR_CODES.OTP_INVALID);
        expect(error.meta?.attemptsRemaining).toBe(OTP_RULES.MAX_ATTEMPTS - attempt);
      }
    });

    it('locks the code after 5 wrong attempts, even for the right code', async () => {
      await service.issue(subject);
      for (let attempt = 1; attempt < OTP_RULES.MAX_ATTEMPTS; attempt++) {
        await service.verify(subject.id, '999999').catch(() => undefined);
      }

      expect(await errorCodeOf(() => service.verify(subject.id, '999999'))).toBe(ERROR_CODES.OTP_ATTEMPTS_EXCEEDED);
      expect(await errorCodeOf(() => service.verify(subject.id, '111111'))).toBe(ERROR_CODES.OTP_ATTEMPTS_EXCEEDED);
      expect(otps.records[0]!.attempts).toBe(OTP_RULES.MAX_ATTEMPTS);
    });

    it('a fresh code after a lockout works again', async () => {
      await service.issue(subject);
      for (let attempt = 0; attempt < OTP_RULES.MAX_ATTEMPTS; attempt++) {
        await service.verify(subject.id, '999999').catch(() => undefined);
      }
      clock.advanceSeconds(OTP_RULES.RESEND_COOLDOWN_SECONDS);
      await service.issue(subject);

      await expect(service.verify(subject.id, '222222')).resolves.toBeUndefined();
    });
  });

  describe('ensureActive', () => {
    it('reuses a live code without sending another email', async () => {
      const first = await service.issue(subject);
      clock.advanceSeconds(60);

      const again = await service.ensureActive(subject);
      expect(again).toEqual(first);
      expect(mailer.sent).toHaveLength(1);
    });

    it('issues a new code when the old one has expired', async () => {
      await service.issue(subject);
      clock.advanceSeconds(OTP_RULES.TTL_SECONDS + 1);

      await service.ensureActive(subject);
      expect(mailer.sent).toHaveLength(2);
      expect(mailer.lastCodeFor(subject.email)).toBe('222222');
    });
  });
});
