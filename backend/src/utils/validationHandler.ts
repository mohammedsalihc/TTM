import { z } from 'zod';

// Strips undefined/null/empty-string keys from a filter object before it's
// passed to a Mongoose query, so callers can build a filter from optional
// fields without manually checking each one. Returns a new object rather
// than mutating the input, since callers may reuse the original.
const isEmpty = (value: unknown): boolean => value === undefined || value === null || value === '';

export const objectSanitizer = <T extends Record<string, unknown>>(obj: T): T => {
  const result = { ...obj };
  Object.keys(result).forEach((key) => {
    if (isEmpty(result[key])) {
      delete result[key];
    }
  });
  return result;
};

// Zod's own issue message (e.g. "Password must be at least 6 characters")
// is far more useful to the end user than a blanket "fill in required
// fields" — surface it as the response's top-level message instead of
// only burying it in the treeified error details.
export const firstValidationMessage = (error: z.ZodError, fallback: string): string =>
  error.issues[0]?.message || fallback;

// Escapes regex metacharacters in free-text search input before it's used
// to build a MongoDB $regex filter, so characters like "(" or "." from a
// user's search term can't break or hijack the query.
export const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
