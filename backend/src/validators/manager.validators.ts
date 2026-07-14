import { z } from 'zod';
import { paginationQuerySchema } from './pagination.validators';

// No designation — unlike employees, managers don't have that field.
export const createManagerSchema = z.object({
  name: z.string({ error: 'Name is required' }).trim().min(1, 'Name is required'),
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .toLowerCase()
    .pipe(z.email('Invalid email address')),
  password: z.string({ error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
  photoUrl: z.string().trim().url('Invalid photo URL').optional(),
  sendEmailInvite: z.boolean().optional().default(false),
});

// Matches by name or email (see ListService.User) — free text, so only
// trimmed, never format-validated.
export const listManagersQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().optional(),
});

// Email/password/role aren't editable here — this is the simple
// "edit name/photo/permissions" form, not a full account-management flow.
export const updateManagerSchema = z.object({
  name: z.string({ error: 'Name is required' }).trim().min(1, 'Name is required'),
  photoUrl: z.string().trim().url('Invalid photo URL').optional(),
  canManageProjects: z.boolean().optional(),
  canManageEmployees: z.boolean().optional(),
});

export type CreateManagerInput = z.infer<typeof createManagerSchema>;
export type UpdateManagerInput = z.infer<typeof updateManagerSchema>;
