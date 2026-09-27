import { API_ROUTES } from '@padosipro/shared';
import { Router } from 'express';
import type { Container } from '../container';
import { authenticate, authRateLimit } from '../middlewares';
import { authRoutes } from './auth.routes';
import { meRoutes } from './me.routes';
import { taskRoutes } from './task.routes';

export function apiRouter(container: Container): Router {
  const router = Router();
  const requireAuth = authenticate(container.tokens);

  router.get(API_ROUTES.HEALTH, (_req, res) => {
    res.json({ status: 'ok' });
  });
  router.use('/auth', authRateLimit(container.config.AUTH_RATE_LIMIT_MAX));
  router.use(authRoutes(container.controllers.auth));
  router.use(meRoutes(container.controllers.me, requireAuth));
  router.use(taskRoutes(container.controllers.tasks, requireAuth));
  return router;
}
