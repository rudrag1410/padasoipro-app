import { ERROR_CODES, OTP_RULES, type OtpChallenge } from '@padosipro/shared';
import { HTTP_STATUS } from '../constants';
import { AppError } from '../errors';
import { buildOtpEmail } from '../helpers/otp-email.helper';
import type {
  IClock,
  ILogger,
  IMailer,
  IOtpGenerator,
  IOtpHasher,
  IOtpRepository,
  IOtpService,
  OtpSubject,
} from '../interfaces';
import { toOtpChallenge } from '../mappers';
import type { OtpRecord } from '../types';
import { addSeconds, secondsBetween } from '../utils';

export type OtpRules = {
  LENGTH: number;
  TTL_SECONDS: number;
  MAX_ATTEMPTS: number;
  RESEND_COOLDOWN_SECONDS: number;
};

export interface OtpServiceDeps {
  otps: IOtpRepository;
  generator: IOtpGenerator;
  hasher: IOtpHasher;
  mailer: IMailer;
  clock: IClock;
  logger: ILogger;
  rules?: OtpRules;
  /** Dev/review only: when set, this code always verifies. Leave undefined in production. */
  bypassCode?: string;
}

export class OtpService implements IOtpService {
  private readonly rules: OtpRules;

  constructor(private readonly deps: OtpServiceDeps) {
    this.rules = deps.rules ?? OTP_RULES;
  }

  async issue(subject: OtpSubject): Promise<OtpChallenge> {
    const now = this.deps.clock.now();
    const latest = await this.deps.otps.findLatestForUser(subject.id);

    if (latest) {
      const resendAvailableAt = addSeconds(latest.createdAt, this.rules.RESEND_COOLDOWN_SECONDS);
      if (now < resendAvailableAt) {
        const retryAfterSeconds = secondsBetween(now, resendAvailableAt);
        throw new AppError(
          HTTP_STATUS.TOO_MANY_REQUESTS,
          ERROR_CODES.OTP_RESEND_COOLDOWN,
          `Please wait ${retryAfterSeconds}s before requesting a new code`,
          { meta: { retryAfterSeconds, otp: this.challenge(subject.email, latest) } },
        );
      }
    }

    const code = this.deps.generator.generate(this.rules.LENGTH);
    const record = await this.deps.otps.replaceForUser({
      userId: subject.id,
      codeHash: this.deps.hasher.hash(code),
      expiresAt: addSeconds(now, this.rules.TTL_SECONDS),
      createdAt: now,
    });

    try {
      await this.deps.mailer.send(buildOtpEmail(subject.email, code));
    } catch (error) {
      // Drop the undeliverable code so the cooldown doesn't block an immediate retry.
      await this.deps.otps.deleteById(record.id);
      this.deps.logger.error({ err: error, userId: subject.id }, 'Failed to send OTP email');
      throw new AppError(
        HTTP_STATUS.BAD_GATEWAY,
        ERROR_CODES.EMAIL_DELIVERY_FAILED,
        "We couldn't send the verification email. Please try again in a moment.",
      );
    }

    return this.challenge(subject.email, record);
  }

  async ensureActive(subject: OtpSubject): Promise<OtpChallenge> {
    const latest = await this.deps.otps.findLatestForUser(subject.id);
    if (latest && this.isUsable(latest, this.deps.clock.now())) return this.challenge(subject.email, latest);

    try {
      return await this.issue(subject);
    } catch (error) {
      // Code is burnt but still inside the cooldown: report its timing, the user can resend shortly.
      if (latest && error instanceof AppError && error.code === ERROR_CODES.OTP_RESEND_COOLDOWN) {
        return this.challenge(subject.email, latest);
      }
      throw error;
    }
  }

  async verify(userId: string, code: string): Promise<void> {
    if (this.deps.bypassCode && code === this.deps.bypassCode) {
      this.deps.logger.warn({ userId }, 'OTP bypass code used — dev/review shortcut, not a real verification');
      const active = await this.deps.otps.findLatestForUser(userId);
      if (active && !active.consumedAt) await this.deps.otps.consume(active.id, this.deps.clock.now());
      return;
    }

    const now = this.deps.clock.now();
    const otp = await this.deps.otps.findLatestForUser(userId);

    if (!otp || otp.consumedAt) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, ERROR_CODES.OTP_NOT_FOUND, 'No active code. Please request a new one.');
    }
    if (now >= otp.expiresAt) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, ERROR_CODES.OTP_EXPIRED, 'This code has expired. Please request a new one.');
    }
    if (otp.attempts >= this.rules.MAX_ATTEMPTS) {
      throw this.attemptsExceeded();
    }

    if (!this.deps.hasher.matches(code, otp.codeHash)) {
      const attempts = await this.deps.otps.incrementAttempts(otp.id);
      const attemptsRemaining = Math.max(0, this.rules.MAX_ATTEMPTS - attempts);
      if (attemptsRemaining === 0) throw this.attemptsExceeded();
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.OTP_INVALID,
        `That code is incorrect. ${attemptsRemaining} ${attemptsRemaining === 1 ? 'attempt' : 'attempts'} left.`,
        { meta: { attemptsRemaining } },
      );
    }

    // Single use: only one concurrent request can flip consumed_at.
    const consumed = await this.deps.otps.consume(otp.id, now);
    if (!consumed) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, ERROR_CODES.OTP_NOT_FOUND, 'This code was already used. Please request a new one.');
    }
  }

  private isUsable(otp: OtpRecord, now: Date): boolean {
    return !otp.consumedAt && now < otp.expiresAt && otp.attempts < this.rules.MAX_ATTEMPTS;
  }

  private challenge(email: string, otp: OtpRecord): OtpChallenge {
    return toOtpChallenge(email, otp, this.rules.RESEND_COOLDOWN_SECONDS);
  }

  private attemptsExceeded(): AppError {
    return new AppError(
      HTTP_STATUS.TOO_MANY_REQUESTS,
      ERROR_CODES.OTP_ATTEMPTS_EXCEEDED,
      'Too many incorrect attempts. Please request a new code.',
      { meta: { attemptsRemaining: 0 } },
    );
  }
}
