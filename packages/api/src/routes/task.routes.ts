import { API_ROUTES } from '@padosipro/shared';
import { Router, type RequestHandler } from 'express';
import type { TaskController } from '../controllers';

export function taskRoutes(controller: TaskController, requireAuth: RequestHandler): Router {
  const router = Router();
  router.get(API_ROUTES.TASKS.CATALOGUE, requireAuth, controller.getCatalogue);
  return router;
}
