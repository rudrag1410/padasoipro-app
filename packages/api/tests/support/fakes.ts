import type { IClock, ILogger, IMailer, IOtpGenerator, IOtpRepository, MailMessage } from '../../src/interfaces';
import type { NewOtp, OtpRecord } from '../../src/types';

export class FakeClock implements IClock {
  constructor(private current = new Date('2026-01-01T10:00:00.000Z')) {}

  now(): Date {
    return new Date(this.current);
  }

  advanceSeconds(seconds: number): void {
    this.current = new Date(this.current.getTime() + seconds * 1000);
  }
}

export class InMemoryMailer implements IMailer {
  readonly sent: MailMessage[] = [];
  failNext = false;

  async send(message: MailMessage): Promise<void> {
    if (this.failNext) {
      this.failNext = false;
      throw new Error('SMTP down');
    }
    this.sent.push(message);
  }

  /** Reads the 6-digit code out of the latest email, like a user would. */
  lastCodeFor(email: string): string {
    const message = [...this.sent].reverse().find((m) => m.to === email);
    const match = message?.text.match(/code is (\d{6})/);
    if (!match?.[1]) throw new Error(`No OTP email sent to ${email}`);
    return match[1];
  }
}

/** Hands out predefined codes in order, then falls back to a counter. */
export class SequenceOtpGenerator implements IOtpGenerator {
  private counter = 0;
  constructor(private readonly codes: string[] = []) {}

  generate(length: number): string {
    const next = this.codes.shift();
    if (next) return next;
    this.counter += 1;
    return String(100000 + this.counter).slice(-length);
  }
}

export class InMemoryOtpRepository implements IOtpRepository {
  records: OtpRecord[] = [];
  private nextId = 1;

  async findLatestForUser(userId: string): Promise<OtpRecord | null> {
    const mine = this.records.filter((r) => r.userId === userId);
    return mine.length ? { ...mine[mine.length - 1]! } : null;
  }

  async replaceForUser(otp: NewOtp): Promise<OtpRecord> {
    this.records = this.records.filter((r) => r.userId !== otp.userId);
    const record: OtpRecord = { id: String(this.nextId++), attempts: 0, consumedAt: null, ...otp };
    this.records.push(record);
    return { ...record };
  }

  async incrementAttempts(id: string): Promise<number> {
    const record = this.records.find((r) => r.id === id);
    if (!record) return 0;
    record.attempts += 1;
    return record.attempts;
  }

  async consume(id: string, at: Date): Promise<boolean> {
    const record = this.records.find((r) => r.id === id);
    if (!record || record.consumedAt) return false;
    record.consumedAt = at;
    return true;
  }

  async deleteById(id: string): Promise<void> {
    this.records = this.records.filter((r) => r.id !== id);
  }
}

export const silentLogger: ILogger = { info() {}, warn() {}, error() {} };
