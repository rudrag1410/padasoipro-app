export const PASSWORD_RULES = {
  MIN_LENGTH: 8,
  /** bcrypt only uses the first 72 bytes of its input. */
  MAX_LENGTH: 72,
} as const;

export const PROFILE_RULES = {
  NAME_MIN: 2,
  NAME_MAX: 60,
  ADDRESS_MIN: 10,
  ADDRESS_MAX: 200,
  BUSINESS_NAME_MAX: 80,
} as const;

export const PHONE_RULES = {
  COUNTRY_CODE: '+91',
  DIGITS: 10,
  /** Indian mobile numbers start with 6, 7, 8 or 9. */
  PATTERN: /^[6-9]\d{9}$/,
} as const;

export const TASK_SELECTION_RULES = {
  MIN: 1,
  MAX: 50,
} as const;
