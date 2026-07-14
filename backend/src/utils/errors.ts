// MongoDB's duplicate-key error (raised when a unique index, e.g.
// Auth.email, is violated) — used to turn a race between two concurrent
// creates with the same email into a clean 409 instead of a 500.
export const isDuplicateKeyError = (err: unknown): boolean =>
  typeof err === 'object' && err !== null && 'code' in err && (err as { code: unknown }).code === 11000;
