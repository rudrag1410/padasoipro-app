import {
  ERROR_CODES,
  OTP_RULES,
  type AuthResponse,
  type LoginDto,
  type OtpChallenge,
  type RegisterDto,
  type VerifyOtpDto,
} from '@padosipro/shared';
import { HTTP_STATUS } from '../constants';
import { AppError } from '../errors';
import type {
  IAuthService,
  IClock,
  IOtpService,
  IPasswordHasher,
  ITokenService,
  IUserRepository,
  IUserService,
} from '../interfaces';
import { addSeconds, toIso } from '../utils';

export interface AuthServiceDeps {
  users: IUserRepository;
  userService: IUserService;
  otpService: IOtpService;
  passwordHasher: IPasswordHasher;
  tokens: ITokenService;
  clock: IClock;
}

const INVALID_CREDENTIALS_MESSAGE = 'Incorrect email or password';

export class AuthService implements IAuthService {
  /** Compared against when the email is unknown, so both paths cost one bcrypt check. */
  private dummyHash?: Promise<string>;

  constructor(private readonly deps: AuthServiceDeps) {}

  async register(dto: RegisterDto): Promise<OtpChallenge> {
    const existing = await this.deps.users.findByEmail(dto.email);
    if (existing) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        ERROR_CODES.EMAIL_ALREADY_REGISTERED,
        'An account with this email already exists. Please log in instead.',
        { fieldErrors: { email: 'This email is already registered' } },
      );
    }

    const user = await this.deps.users.create({
      email: dto.email,
      passwordHash: await this.deps.passwordHasher.hash(dto.password),
      createdAt: this.deps.clock.now(),
    });
    return this.deps.otpService.issue(user);
  }

  async verifyEmail(dto: VerifyOtpDto): Promise<AuthResponse> {
    const user = await this.deps.users.findByEmail(dto.email);
    if (!user) {
      // Same answer as a wrong code, so this endpoint can't be used to discover accounts.
      throw new AppError(HTTP_STATUS.BAD_REQUEST, ERROR_CODES.OTP_NOT_FOUND, 'No active code. Please request a new one.');
    }
    if (user.emailVerifiedAt) {
      throw new AppError(HTTP_STATUS.CONFLICT, ERROR_CODES.EMAIL_ALREADY_VERIFIED, 'This email is already verified. Please log in.');
    }

    await this.deps.otpService.verify(user.id, dto.code);
    await this.deps.users.markEmailVerified(user.id, this.deps.clock.now());
    return this.createSession(user.id);
  }

  async resendOtp(email: string): Promise<OtpChallenge> {
    const user = await this.deps.users.findByEmail(email);
    if (!user || user.emailVerifiedAt) {
      // Don't reveal whether the address is registered: respond as if a code went out.
      const now = this.deps.clock.now();
      return {
        email,
        expiresAt: toIso(addSeconds(now, OTP_RULES.TTL_SECONDS)),
        resendAvailableAt: toIso(addSeconds(now, OTP_RULES.RESEND_COOLDOWN_SECONDS)),
      };
    }
    return this.deps.otpService.issue(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.deps.users.findByEmail(dto.email);
    const passwordOk = await this.deps.passwordHasher.compare(dto.password, user?.passwordHash ?? (await this.getDummyHash()));

    if (!user || !passwordOk) {
      throw new AppError(HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.INVALID_CREDENTIALS, INVALID_CREDENTIALS_MESSAGE);
    }

    if (!user.emailVerifiedAt) {
      // Correct password but unverified: send them back to verification with a usable code.
      const otp = await this.deps.otpService.ensureActive(user);
      throw new AppError(
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.EMAIL_NOT_VERIFIED,
        'Please verify your email to continue. We sent you a code.',
        { meta: { otp } },
      );
    }

    return this.createSession(user.id);
  }

  private async createSession(userId: string): Promise<AuthResponse> {
    const { token, expiresAt } = this.deps.tokens.issue({ sub: userId });
    const user = await this.deps.userService.getUser(userId);
    return { token, expiresAt: toIso(expiresAt), user };
  }

  private getDummyHash(): Promise<string> {
    this.dummyHash ??= this.deps.passwordHasher.hash('timing-equaliser-not-a-real-password');
    return this.dummyHash;
  }
}
