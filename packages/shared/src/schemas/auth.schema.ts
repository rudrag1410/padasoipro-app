import { z } from 'zod';
import { OTP_RULES } from '../constants/otp.constants';
import { PASSWORD_RULES } from '../constants/validation.constants';
import { normalizeEmail } from '../utils/email.utils';

export const emailSchema = z
  .string({ error: 'Email is required' })
  .trim()
  .min(1, 'Email is required')
  .max(254, 'Email is too long')
  .pipe(z.email('Enter a valid email address'))
  .transform(normalizeEmail);

export const passwordSchema = z
  .string({ error: 'Password is required' })
  .min(PASSWORD_RULES.MIN_LENGTH, `Password must be at least ${PASSWORD_RULES.MIN_LENGTH} characters`)
  .max(PASSWORD_RULES.MAX_LENGTH, `Password must be at most ${PASSWORD_RULES.MAX_LENGTH} characters`)
  .regex(/[A-Za-z]/, 'Password must contain a letter')
  .regex(/\d/, 'Password must contain a number');

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string({ error: 'Please confirm your password' }).min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const loginSchema = z.object({
  email: emailSchema,
  // Only presence is checked on login; strength rules apply at registration.
  password: z.string({ error: 'Password is required' }).min(1, 'Password is required').max(PASSWORD_RULES.MAX_LENGTH),
});

export const otpCodeSchema = z
  .string({ error: 'Code is required' })
  .trim()
  .regex(new RegExp(`^\\d{${OTP_RULES.LENGTH}}$`), `Enter the ${OTP_RULES.LENGTH}-digit code`);

export const verifyOtpSchema = z.object({
  email: emailSchema,
  code: otpCodeSchema,
});

export const resendOtpSchema = z.object({
  email: emailSchema,
});

export type RegisterInput = z.input<typeof registerSchema>;
export type RegisterDto = z.output<typeof registerSchema>;
export type LoginInput = z.input<typeof loginSchema>;
export type LoginDto = z.output<typeof loginSchema>;
export type VerifyOtpInput = z.input<typeof verifyOtpSchema>;
export type VerifyOtpDto = z.output<typeof verifyOtpSchema>;
export type ResendOtpDto = z.output<typeof resendOtpSchema>;
