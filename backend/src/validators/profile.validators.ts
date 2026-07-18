import { z } from 'zod';

// The self-service "edit my profile" form — deliberately narrower than the
// Admin-facing employee/manager update schemas (no role, no permissions).
export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').optional(),
  photoUrl: z.string().trim().url('Invalid photo URL').optional(),
  phone: z.string().trim().min(1, 'Phone number is required').optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string({ error: 'Current password is required' }).min(1, 'Current password is required'),
  newPassword: z.string({ error: 'New password is required' }).min(6, 'New password must be at least 6 characters'),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
