import { z } from 'zod';
import { paginationQuerySchema } from './pagination.validators';

// { error: '...' } covers the field being entirely absent from the body;
// without it, a missing key fails Zod's base string-type check first and
// never reaches the .min()/.pipe() message below it.
export const createEmployeeSchema = z.object({
  name: z.string({ error: 'Name is required' }).trim().min(1, 'Name is required'),
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .toLowerCase()
    .pipe(z.email('Invalid email address')),
  password: z.string({ error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
  designation: z.string().trim().min(1).optional(),
  photoUrl: z.string().trim().url('Invalid photo URL').optional(),
  sendEmailInvite: z.boolean().optional().default(false),
});

// Matches by name or email (see ListService.User) — free text, so only
// trimmed, never format-validated.
export const listEmployeesQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().optional(),
});

// Email/password/role are intentionally not editable here — this is the
// simple "edit name/designation" form, not a full account-management flow.
export const updateEmployeeSchema = z.object({
  name: z.string({ error: 'Name is required' }).trim().min(1, 'Name is required'),
  designation: z.string().trim().min(1).optional(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
