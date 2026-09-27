import { API_ROUTES, loginSchema, registerSchema, resendOtpSchema, verifyOtpSchema } from '@padosipro/shared';
import { Router } from 'express';
import type { AuthController } from '../controllers';
import { validateBody } from '../middlewares';

export function authRoutes(controller: AuthController): Router {
  const router = Router();
  router.post(API_ROUTES.AUTH.REGISTER, validateBody(registerSchema), controller.register);
  router.post(API_ROUTES.AUTH.VERIFY_OTP, validateBody(verifyOtpSchema), controller.verifyOtp);
  router.post(API_ROUTES.AUTH.RESEND_OTP, validateBody(resendOtpSchema), controller.resendOtp);
  router.post(API_ROUTES.AUTH.LOGIN, validateBody(loginSchema), controller.login);
  return router;
}
