import { loadConfig } from '../../src/config/env';
import { createApp } from '../../src/app';
import { createContainer } from '../../src/container';
import { openDatabase } from '../../src/db/database';
import { seedCatalogue } from '../../src/db/seed/seed-catalogue';
import { FakeClock, InMemoryMailer, silentLogger } from './fakes';

export const TEST_SECRETS = {
  JWT_SECRET: 'test-jwt-secret-that-is-at-least-32-characters',
  OTP_HASH_SECRET: 'test-otp-secret-that-is-at-least-32-characters',
};

/** A fully wired app on an in-memory database, with a controllable clock and a mailbox we can read. */
export function buildTestApp() {
  const config = loadConfig({
    NODE_ENV: 'test',
    ...TEST_SECRETS,
    BCRYPT_COST: '4',
    AUTH_RATE_LIMIT_MAX: '10000',
    DATABASE_PATH: ':memory:',
  });
  const db = openDatabase(':memory:');
  seedCatalogue(db);

  const clock = new FakeClock();
  const mailer = new InMemoryMailer();
  const container = createContainer(config, db, silentLogger, { clock, mailer });
  const app = createApp(container);

  return { app, db, clock, mailer, container };
}
