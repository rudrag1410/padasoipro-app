import { API_PREFIX, ERROR_CODES, OTP_RULES } from '@padosipro/shared';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { buildTestApp, TEST_SECRETS } from '../support/test-app';

const EMAIL = 'asha@example.com';
const PASSWORD = 'secret123';

describe('Auth flow (HTTP)', () => {
  let ctx: ReturnType<typeof buildTestApp>;
  const api = () => request(ctx.app);

  const register = (body: object = { email: EMAIL, password: PASSWORD, confirmPassword: PASSWORD }) =>
    api().post(`${API_PREFIX}/auth/register`).send(body);
  const login = (email = EMAIL, password = PASSWORD) => api().post(`${API_PREFIX}/auth/login`).send({ email, password });
  const verify = (code: string, email = EMAIL) => api().post(`${API_PREFIX}/auth/verify-otp`).send({ email, code });

  async function registeredAndVerified(): Promise<string> {
    await register();
    const res = await verify(ctx.mailer.lastCodeFor(EMAIL));
    return res.body.token as string;
  }

  beforeEach(() => {
    ctx = buildTestApp();
  });

  describe('register', () => {
    it('creates the account, emails a code and returns its timing', async () => {
      const res = await register();

      expect(res.status).toBe(201);
      expect(res.body.otp.email).toBe(EMAIL);
      expect(ctx.mailer.lastCodeFor(EMAIL)).toMatch(/^\d{6}$/);
    });

    it('stores a bcrypt hash, never the password', async () => {
      await register();
      const row = ctx.db.prepare('SELECT password_hash FROM users WHERE email = ?').get(EMAIL) as { password_hash: string };
      expect(row.password_hash).toMatch(/^\$2[aby]\$/);
      expect(row.password_hash).not.toContain(PASSWORD);
    });

    it('stores only a hash of the OTP', async () => {
      await register();
      const code = ctx.mailer.lastCodeFor(EMAIL);
      const row = ctx.db.prepare('SELECT code_hash FROM email_otps').get() as { code_hash: string };
      expect(row.code_hash).not.toContain(code);
    });

    it('normalises email case and rejects duplicates', async () => {
      await register();
      const res = await register({ email: '  ASHA@Example.com ', password: PASSWORD, confirmPassword: PASSWORD });
      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe(ERROR_CODES.EMAIL_ALREADY_REGISTERED);
    });

    it('returns field-level messages for bad input', async () => {
      const res = await register({ email: 'not-an-email', password: 'short', confirmPassword: 'different' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe(ERROR_CODES.VALIDATION_FAILED);
      expect(Object.keys(res.body.error.fieldErrors)).toEqual(expect.arrayContaining(['email', 'password']));
    });

    it('rejects mismatched passwords', async () => {
      const res = await register({ email: EMAIL, password: PASSWORD, confirmPassword: 'secret124' });
      expect(res.body.error.fieldErrors.confirmPassword).toBe('Passwords do not match');
    });

    it('rejects malformed JSON with the standard error shape', async () => {
      const res = await api().post(`${API_PREFIX}/auth/register`).set('Content-Type', 'application/json').send('{bad');
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe(ERROR_CODES.VALIDATION_FAILED);
    });
  });

  describe('login rules', () => {
    it('sends unverified users back to verification with a usable code', async () => {
      await register();
      const res = await login();

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe(ERROR_CODES.EMAIL_NOT_VERIFIED);
      expect(res.body.error.meta.otp.email).toBe(EMAIL);
      expect(res.body.token).toBeUndefined();
    });

    it('does not reveal an unverified account to someone with the wrong password', async () => {
      await register();
      const res = await login(EMAIL, 'wrongpass1');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe(ERROR_CODES.INVALID_CREDENTIALS);
    });

    it('gives the same answer for an unknown email and a wrong password', async () => {
      await registeredAndVerified();
      const unknown = await login('nobody@example.com', PASSWORD);
      const wrong = await login(EMAIL, 'wrongpass1');

      expect(unknown.status).toBe(401);
      expect(wrong.status).toBe(401);
      expect(unknown.body).toEqual(wrong.body);
    });

    it('logs in a verified user and returns a working token', async () => {
      await registeredAndVerified();
      const res = await login();

      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({ email: EMAIL, emailVerified: true, profileCompleted: false });
      expect(res.body.user.passwordHash).toBeUndefined();

      const me = await api().get(`${API_PREFIX}/me`).set('Authorization', `Bearer ${res.body.token}`);
      expect(me.status).toBe(200);
    });

    it('rejects expired, tampered and missing tokens', async () => {
      const token = await registeredAndVerified();
      const payload = jwt.decode(token) as { sub: string };

      const forged = jwt.sign({ sub: payload.sub }, 'some-other-secret-that-is-long-enough!!', { issuer: 'padosipro-api' });
      const expired = jwt.sign({ sub: payload.sub, exp: Math.floor(ctx.clock.now().getTime() / 1000) - 10 }, TEST_SECRETS.JWT_SECRET, {
        issuer: 'padosipro-api',
      });

      for (const header of [`Bearer ${forged}`, `Bearer ${expired}`, 'Bearer nonsense', '']) {
        const res = await api().get(`${API_PREFIX}/me`).set('Authorization', header);
        expect(res.status).toBe(401);
        expect(res.body.error.code).toBe(ERROR_CODES.UNAUTHORIZED);
      }
    });
  });

  describe('verify & resend', () => {
    it('verifies with the emailed code and signs the user in', async () => {
      await register();
      const res = await verify(ctx.mailer.lastCodeFor(EMAIL));

      expect(res.status).toBe(200);
      expect(res.body.token).toEqual(expect.any(String));
      expect(res.body.user.emailVerified).toBe(true);
    });

    it('explains a wrong code and how many tries are left', async () => {
      await register();
      const wrong = ctx.mailer.lastCodeFor(EMAIL) === '000000' ? '111111' : '000000';
      const res = await verify(wrong);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe(ERROR_CODES.OTP_INVALID);
      expect(res.body.error.meta.attemptsRemaining).toBe(OTP_RULES.MAX_ATTEMPTS - 1);
    });

    it('explains an expired code', async () => {
      await register();
      ctx.clock.advanceSeconds(OTP_RULES.TTL_SECONDS + 1);
      const res = await verify(ctx.mailer.lastCodeFor(EMAIL));
      expect(res.body.error.code).toBe(ERROR_CODES.OTP_EXPIRED);
    });

    it('enforces the resend cooldown over HTTP', async () => {
      await register();
      const early = await api().post(`${API_PREFIX}/auth/resend-otp`).send({ email: EMAIL });
      expect(early.status).toBe(429);
      expect(early.body.error.code).toBe(ERROR_CODES.OTP_RESEND_COOLDOWN);

      ctx.clock.advanceSeconds(OTP_RULES.RESEND_COOLDOWN_SECONDS);
      const later = await api().post(`${API_PREFIX}/auth/resend-otp`).send({ email: EMAIL });
      expect(later.status).toBe(200);
      expect(ctx.mailer.sent).toHaveLength(2);
    });

    it('answers resend for unknown emails without sending anything', async () => {
      const res = await api().post(`${API_PREFIX}/auth/resend-otp`).send({ email: 'ghost@example.com' });
      expect(res.status).toBe(200);
      expect(ctx.mailer.sent).toHaveLength(0);
    });

    it('refuses to verify an already verified email', async () => {
      await registeredAndVerified();
      const res = await verify('123456');
      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe(ERROR_CODES.EMAIL_ALREADY_VERIFIED);
    });
  });
});
