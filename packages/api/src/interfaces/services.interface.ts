import type {
  AuthResponse,
  CategoryWithTasks,
  LoginDto,
  OtpChallenge,
  ProfileDto,
  RegisterDto,
  Task,
  User,
  VerifyOtpDto,
} from '@padosipro/shared';

export interface OtpSubject {
  id: string;
  email: string;
}

export interface IOtpService {
  /** Creates, stores (hashed) and emails a fresh code, replacing any earlier one. Enforces the resend cooldown. */
  issue(subject: OtpSubject): Promise<OtpChallenge>;
  /** Returns the live code's timing, or issues a new code when there is no usable one. */
  ensureActive(subject: OtpSubject): Promise<OtpChallenge>;
  /** Throws a descriptive AppError unless `code` matches the live code; on success the code is used up. */
  verify(userId: string, code: string): Promise<void>;
}

export interface IAuthService {
  register(dto: RegisterDto): Promise<OtpChallenge>;
  verifyEmail(dto: VerifyOtpDto): Promise<AuthResponse>;
  resendOtp(email: string): Promise<OtpChallenge>;
  login(dto: LoginDto): Promise<AuthResponse>;
}

export interface IUserService {
  getUser(userId: string): Promise<User>;
  saveProfile(userId: string, dto: ProfileDto): Promise<User>;
}

export interface ITaskService {
  getCatalogue(): Promise<CategoryWithTasks[]>;
  getSelection(userId: string): Promise<Task[]>;
  saveSelection(userId: string, taskIds: string[]): Promise<Task[]>;
}
