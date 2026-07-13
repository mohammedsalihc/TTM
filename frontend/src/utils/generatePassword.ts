// Excludes visually-ambiguous characters (0/O, 1/l/I) so a password read
// off-screen to someone doesn't get mistyped.
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';

export const generatePassword = (length = 10): string => {
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => CHARSET[b % CHARSET.length]).join('');
};
