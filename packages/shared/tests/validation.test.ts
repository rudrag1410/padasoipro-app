import { describe, expect, it } from 'vitest';
import { formatIndianMobile, profileSchema, registerSchema, toNationalMobile, verifyOtpSchema } from '../src';

describe('toNationalMobile', () => {
  it.each([
    ['9876543210', '9876543210'],
    ['+91 98765 43210', '9876543210'],
    ['+91-98765-43210', '9876543210'],
    ['09876543210', '9876543210'],
    ['919876543210', '9876543210'],
  ])('accepts %s', (input, expected) => {
    expect(toNationalMobile(input)).toBe(expected);
  });

  it.each(['12345', '5876543210', '98765432101', '+1 9876543210', 'abcdefghij'])('rejects %s', (input) => {
    expect(toNationalMobile(input)).toBeNull();
  });

  it('formats for display', () => {
    expect(formatIndianMobile('9876543210')).toBe('+91 98765 43210');
  });
});

describe('schemas', () => {
  it('lower-cases and trims email on register', () => {
    const parsed = registerSchema.parse({ email: ' Asha@Example.COM ', password: 'secret123', confirmPassword: 'secret123' });
    expect(parsed.email).toBe('asha@example.com');
  });

  it('requires letters and numbers in the password', () => {
    expect(registerSchema.safeParse({ email: 'a@b.co', password: 'onlyletters', confirmPassword: 'onlyletters' }).success).toBe(false);
    expect(registerSchema.safeParse({ email: 'a@b.co', password: '12345678', confirmPassword: '12345678' }).success).toBe(false);
  });

  it('accepts only 6-digit OTP codes', () => {
    expect(verifyOtpSchema.safeParse({ email: 'a@b.co', code: '012345' }).success).toBe(true);
    expect(verifyOtpSchema.safeParse({ email: 'a@b.co', code: '12345' }).success).toBe(false);
    expect(verifyOtpSchema.safeParse({ email: 'a@b.co', code: '12345a' }).success).toBe(false);
  });

  it('turns a blank business name into null', () => {
    const parsed = profileSchema.parse({ name: 'Asha', mobile: '9876543210', address: '12 MG Road, Pune', businessName: '  ' });
    expect(parsed.businessName).toBeNull();
  });
});
