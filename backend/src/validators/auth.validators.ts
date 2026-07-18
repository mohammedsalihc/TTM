import { z } from 'zod';

// { error: '...' } covers the field being entirely absent from the body;
// without it, a missing key fails Zod's base string-type check first and
// never reaches the .min()/.pipe() message below it.
export const registerSchema = z.object({
  businessName: z.string({ error: 'Business name is required' }).trim().min(1, 'Business name is required'),
  fullName: z.string({ error: 'Full name is required' }).trim().min(1, 'Full name is required'),
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .toLowerCase()
    .pipe(z.email('Invalid email address')),
  password: z.string({ error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .toLowerCase()
    .pipe(z.email('Invalid email address')),
  password: z.string({ error: 'Password is required' }).min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .toLowerCase()
    .pipe(z.email('Invalid email address')),
});

export const resetPasswordSchema = z.object({
  token: z.string({ error: 'Reset token is required' }).min(1, 'Reset token is required'),
  newPassword: z.string({ error: 'New password is required' }).min(6, 'New password must be at least 6 characters'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
