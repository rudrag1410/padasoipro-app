import { z } from 'zod';
import { PROFILE_RULES } from '../constants/validation.constants';
import { toNationalMobile } from '../utils/phone.utils';

export const mobileSchema = z
  .string({ error: 'Mobile number is required' })
  .trim()
  .min(1, 'Mobile number is required')
  .transform((value, ctx) => {
    const national = toNationalMobile(value);
    if (!national) {
      ctx.addIssue({ code: 'custom', message: 'Enter a valid 10-digit Indian mobile number' });
      return z.NEVER;
    }
    return national;
  });

export const profileSchema = z.object({
  name: z
    .string({ error: 'Name is required' })
    .trim()
    .min(PROFILE_RULES.NAME_MIN, `Name must be at least ${PROFILE_RULES.NAME_MIN} characters`)
    .max(PROFILE_RULES.NAME_MAX, `Name must be at most ${PROFILE_RULES.NAME_MAX} characters`)
    .regex(/^[\p{L}][\p{L} .'-]*$/u, 'Name can only contain letters, spaces, . \' and -'),
  mobile: mobileSchema,
  address: z
    .string({ error: 'Address is required' })
    .trim()
    .min(PROFILE_RULES.ADDRESS_MIN, `Address must be at least ${PROFILE_RULES.ADDRESS_MIN} characters`)
    .max(PROFILE_RULES.ADDRESS_MAX, `Address must be at most ${PROFILE_RULES.ADDRESS_MAX} characters`),
  // Optional: most PadosiPro customers are households, not businesses.
  businessName: z
    .string()
    .trim()
    .max(PROFILE_RULES.BUSINESS_NAME_MAX, `Business name must be at most ${PROFILE_RULES.BUSINESS_NAME_MAX} characters`)
    .optional()
    .nullable()
    .transform((value) => (value ? value : null)),
});

export type ProfileInput = z.input<typeof profileSchema>;
export type ProfileDto = z.output<typeof profileSchema>;
