import { pino } from 'pino';

export function createLogger(env: string) {
  return pino({
    level: env === 'test' ? 'silent' : 'info',
    redact: ['req.headers.authorization', 'req.body.password', 'req.body.confirmPassword', 'req.body.code'],
  });
}
