import type {
  AuthResponse,
  LoginDto,
  RegisterDto,
  RegisterResponse,
  ResendOtpDto,
  ResendOtpResponse,
  VerifyOtpDto,
} from '@padosipro/shared';
import type { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants';
import type { IAuthService } from '../interfaces';

export class AuthController {
  constructor(private readonly auth: IAuthService) {}

  register = async (req: Request, res: Response<RegisterResponse>) => {
    const otp = await this.auth.register(req.body as RegisterDto);
    res.status(HTTP_STATUS.CREATED).json({ message: `We sent a verification code to ${otp.email}`, otp });
  };

  verifyOtp = async (req: Request, res: Response<AuthResponse>) => {
    res.json(await this.auth.verifyEmail(req.body as VerifyOtpDto));
  };

  resendOtp = async (req: Request, res: Response<ResendOtpResponse>) => {
    const otp = await this.auth.resendOtp((req.body as ResendOtpDto).email);
    res.json({ message: 'If this email needs verifying, a new code is on its way.', otp });
  };

  login = async (req: Request, res: Response<AuthResponse>) => {
    res.json(await this.auth.login(req.body as LoginDto));
  };
}
