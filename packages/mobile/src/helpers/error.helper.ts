import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { COPY } from '@/constants';
import { ApiError } from '@/services/api';

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return COPY.GENERIC_ERROR;
}

/**
 * Puts server-side field errors onto the matching inputs.
 * Returns true if at least one field got a message (so a banner isn't needed).
 */
export function applyFieldErrors<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>, fields: readonly Path<T>[]): boolean {
  if (!(error instanceof ApiError)) return false;
  let applied = false;
  for (const field of fields) {
    const message = error.fieldErrors[field];
    if (message) {
      setError(field, { type: 'server', message });
      applied = true;
    }
  }
  return applied;
}
