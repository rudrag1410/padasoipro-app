import { API_PREFIX, ERROR_CODES } from '@padosipro/shared';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { buildTestApp } from '../support/test-app';

const PROFILE = {
  name: 'Asha Verma',
  mobile: '+91 98765 43210',
  address: 'Flat 12B, Green Park, Bengaluru 560001',
  businessName: '',
};

describe('Profile and task selection (HTTP)', () => {
  let ctx: ReturnType<typeof buildTestApp>;
  let token: string;
  const authed = () => ({ Authorization: `Bearer ${token}` });

  beforeEach(async () => {
    ctx = buildTestApp();
    const api = request(ctx.app);
    await api.post(`${API_PREFIX}/auth/register`).send({ email: 'asha@example.com', password: 'secret123', confirmPassword: 'secret123' });
    const res = await api
      .post(`${API_PREFIX}/auth/verify-otp`)
      .send({ email: 'asha@example.com', code: ctx.mailer.lastCodeFor('asha@example.com') });
    token = res.body.token;
  });

  it('serves a catalogue of at least 20 tasks in at least 4 categories', async () => {
    const res = await request(ctx.app).get(`${API_PREFIX}/tasks`).set(authed());
    const categories = res.body.categories as { tasks: unknown[] }[];

    expect(categories.length).toBeGreaterThanOrEqual(4);
    expect(categories.flatMap((c) => c.tasks).length).toBeGreaterThanOrEqual(20);
  });

  it('saves the profile, normalising the mobile number and optional business name', async () => {
    const res = await request(ctx.app).put(`${API_PREFIX}/me/profile`).set(authed()).send(PROFILE);

    expect(res.status).toBe(200);
    expect(res.body.user.profileCompleted).toBe(true);
    expect(res.body.user.profile).toEqual({
      name: 'Asha Verma',
      mobile: '9876543210',
      address: PROFILE.address,
      businessName: null,
    });
  });

  it.each([
    ['12345', 'too short'],
    ['5876543210', 'does not start with 6-9'],
    ['+1 9876543210', 'wrong country code'],
    ['98765432100', 'too long'],
  ])('rejects mobile %s (%s)', async (mobile) => {
    const res = await request(ctx.app).put(`${API_PREFIX}/me/profile`).set(authed()).send({ ...PROFILE, mobile });
    expect(res.status).toBe(400);
    expect(res.body.error.fieldErrors.mobile).toBeDefined();
  });

  it('requires a profile before tasks can be saved', async () => {
    const res = await request(ctx.app).put(`${API_PREFIX}/me/tasks`).set(authed()).send({ taskIds: ['plumber'] });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe(ERROR_CODES.PROFILE_REQUIRED);
  });

  it('rejects unknown task ids and empty selections', async () => {
    await request(ctx.app).put(`${API_PREFIX}/me/profile`).set(authed()).send(PROFILE);

    const unknown = await request(ctx.app).put(`${API_PREFIX}/me/tasks`).set(authed()).send({ taskIds: ['plumber', 'moon-landing'] });
    expect(unknown.status).toBe(400);
    expect(unknown.body.error.meta.unknownIds).toEqual(['moon-landing']);

    const empty = await request(ctx.app).put(`${API_PREFIX}/me/tasks`).set(authed()).send({ taskIds: [] });
    expect(empty.status).toBe(400);
  });

  it('saves, replaces and returns the selected tasks', async () => {
    await request(ctx.app).put(`${API_PREFIX}/me/profile`).set(authed()).send(PROFILE);

    await request(ctx.app).put(`${API_PREFIX}/me/tasks`).set(authed()).send({ taskIds: ['plumber', 'grocery-run'] });
    const saved = await request(ctx.app)
      .put(`${API_PREFIX}/me/tasks`)
      .set(authed())
      .send({ taskIds: ['doctor-visit', 'plumber', 'plumber'] });
    expect(saved.status).toBe(200);

    const mine = await request(ctx.app).get(`${API_PREFIX}/me/tasks`).set(authed());
    expect(mine.body.tasks.map((t: { id: string }) => t.id).sort()).toEqual(['doctor-visit', 'plumber']);

    const me = await request(ctx.app).get(`${API_PREFIX}/me`).set(authed());
    expect(me.body.user.hasSelectedTasks).toBe(true);
  });

  it('returns 404 in the standard shape for unknown routes', async () => {
    const res = await request(ctx.app).get(`${API_PREFIX}/nope`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe(ERROR_CODES.NOT_FOUND);
  });
});
