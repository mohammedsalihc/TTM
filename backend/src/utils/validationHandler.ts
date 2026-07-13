import { z } from 'zod';

// Strips undefined/null/empty-string keys from a filter object before it's
// passed to a Mongoose query, so callers can build a filter from optional
// fields without manually checking each one.
const isEmpty = (value: unknown): boolean => value === undefined || value === null || value === '';

export const objectSanitizer = <T extends Record<string, unknown>>(obj: T): T => {
  Object.keys(obj).forEach((key) => {
    if (isEmpty(obj[key])) {
      delete obj[key];
    }
  });
  return obj;
};

// Zod's own issue message (e.g. "Password must be at least 6 characters")
// is far more useful to the end user than a blanket "fill in required
// fields" — surface it as the response's top-level message instead of
// only burying it in the treeified error details.
export const firstValidationMessage = (error: z.ZodError, fallback: string): string =>
  error.issues[0]?.message || fallback;
