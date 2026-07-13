import { z } from 'zod';

export const registerSchema = z.object({
  businessName: z.string().trim().min(1, 'Business name is required'),
  fullName: z.string().trim().min(1, 'Full name is required'),
  email: z.string().trim().toLowerCase().pipe(z.email('Invalid email address')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email('Invalid email address')),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
