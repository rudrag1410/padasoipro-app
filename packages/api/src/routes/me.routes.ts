import { API_ROUTES, profileSchema, taskSelectionSchema } from '@padosipro/shared';
import { Router, type RequestHandler } from 'express';
import type { MeController } from '../controllers';
import { validateBody } from '../middlewares';

export function meRoutes(controller: MeController, requireAuth: RequestHandler): Router {
  const router = Router();
  router.get(API_ROUTES.ME.ROOT, requireAuth, controller.getMe);
  router.put(API_ROUTES.ME.PROFILE, requireAuth, validateBody(profileSchema), controller.saveProfile);
  router.get(API_ROUTES.ME.TASKS, requireAuth, controller.getTasks);
  router.put(API_ROUTES.ME.TASKS, requireAuth, validateBody(taskSelectionSchema), controller.saveTasks);
  return router;
}
