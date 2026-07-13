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
