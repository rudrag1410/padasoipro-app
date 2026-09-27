import { PHONE_RULES } from '../constants/validation.constants';

/**
 * Reduces user input like "+91 98765 43210", "098765-43210" or "9876543210"
 * to the bare 10-digit national number. Returns null when it cannot.
 */
export function toNationalMobile(input: string): string | null {
  let digits = input.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return PHONE_RULES.PATTERN.test(digits) ? digits : null;
}

/** "9876543210" -> "+91 98765 43210" */
export function formatIndianMobile(national: string): string {
  const digits = national.replace(/\D/g, '').slice(-PHONE_RULES.DIGITS);
  return `${PHONE_RULES.COUNTRY_CODE} ${digits.slice(0, 5)} ${digits.slice(5)}`.trim();
}
