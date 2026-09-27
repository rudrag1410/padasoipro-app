import type { AppConfig } from './config/env';
import { AuthController, MeController, TaskController } from './controllers';
import type { Database } from './db/database';
import {
  BcryptPasswordHasher,
  ConsoleMailer,
  CryptoOtpGenerator,
  HmacOtpHasher,
  JwtTokenService,
  SmtpMailer,
  SystemClock,
} from './infrastructure';
import type { IClock, ILogger, IMailer, IOtpGenerator, IPasswordHasher, ITokenService } from './interfaces';
import {
  SqliteOtpRepository,
  SqliteProfileRepository,
  SqliteTaskRepository,
  SqliteUserRepository,
} from './repositories/sqlite';
import { AuthService, OtpService, TaskService, UserService } from './services';

/** Swappable collaborators. Tests override these with fakes (in-memory mailer, fixed clock...). */
export interface ContainerOverrides {
  clock?: IClock;
  mailer?: IMailer;
  otpGenerator?: IOtpGenerator;
  passwordHasher?: IPasswordHasher;
}

/**
 * Composition root: the one place concrete classes are chosen and wired together.
 * Everything else depends on interfaces.
 */
export function createContainer(config: AppConfig, db: Database, logger: ILogger, overrides: ContainerOverrides = {}) {
  const clock = overrides.clock ?? new SystemClock();
  const mailer: IMailer =
    overrides.mailer ??
    (config.MAIL_DRIVER === 'console'
      ? new ConsoleMailer(logger)
      : new SmtpMailer({
          host: config.SMTP_HOST,
          port: config.SMTP_PORT,
          secure: config.SMTP_SECURE,
          user: config.SMTP_USER,
          pass: config.SMTP_PASS,
          from: config.MAIL_FROM,
        }));
  const tokens: ITokenService = new JwtTokenService(config.JWT_SECRET, config.JWT_EXPIRES_IN_SECONDS, clock);
  const passwordHasher = overrides.passwordHasher ?? new BcryptPasswordHasher(config.BCRYPT_COST);

  const repositories = {
    users: new SqliteUserRepository(db),
    profiles: new SqliteProfileRepository(db),
    otps: new SqliteOtpRepository(db),
    tasks: new SqliteTaskRepository(db),
  };

  const otpService = new OtpService({
    otps: repositories.otps,
    generator: overrides.otpGenerator ?? new CryptoOtpGenerator(),
    hasher: new HmacOtpHasher(config.OTP_HASH_SECRET),
    mailer,
    clock,
    logger,
  });
  const userService = new UserService({ ...repositories, clock });
  const taskService = new TaskService({ tasks: repositories.tasks, profiles: repositories.profiles, clock });
  const authService = new AuthService({
    users: repositories.users,
    userService,
    otpService,
    passwordHasher,
    tokens,
    clock,
  });

  return {
    config,
    logger,
    tokens,
    services: { auth: authService, otp: otpService, users: userService, tasks: taskService },
    controllers: {
      auth: new AuthController(authService),
      me: new MeController(userService, taskService),
      tasks: new TaskController(taskService),
    },
  };
}

export type Container = ReturnType<typeof createContainer>;
