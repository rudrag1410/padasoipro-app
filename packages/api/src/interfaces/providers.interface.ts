import type { IssuedToken, TokenPayload } from '../types';

export interface IClock {
  now(): Date;
}

export interface IPasswordHasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}

export interface IOtpGenerator {
  generate(length: number): string;
}

/** One-way, keyed hash for OTP codes. */
export interface IOtpHasher {
  hash(code: string): string;
  matches(code: string, hash: string): boolean;
}

export interface ITokenService {
  issue(payload: TokenPayload): IssuedToken;
  /** Returns null for anything invalid or expired. */
  verify(token: string): TokenPayload | null;
}

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface IMailer {
  send(message: MailMessage): Promise<void>;
}

export interface ILogger {
  info(obj: object | string, msg?: string): void;
  warn(obj: object | string, msg?: string): void;
  error(obj: object | string, msg?: string): void;
}
