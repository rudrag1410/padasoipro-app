import type { ZodError } from 'zod';

/** Flattens a ZodError into `{ field: firstMessage }`, which is what forms need. */
export function toFieldErrors(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join('.') : '_root';
    fieldErrors[key] ??= issue.message;
  }
  return fieldErrors;
}
