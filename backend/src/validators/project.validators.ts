import { z } from 'zod';
import { paginationQuerySchema } from './pagination.validators';

const PROJECT_STATUSES = ['active', 'on-hold', 'completed', 'cancelled'] as const;

// { error: '...' } covers the field being entirely absent from the body;
// without it, a missing key fails Zod's base type check first and never
// reaches the .min()/.pipe() message below it (see auth/employee validators).
export const createProjectSchema = z.object({
  name: z.string({ error: 'Project name is required' }).trim().min(1, 'Project name is required'),
  description: z.string().trim().optional(),
  startDate: z.coerce.date({ error: 'Invalid start date' }).optional(),
  dueDate: z.coerce.date({ error: 'Invalid due date' }).optional(),
  ownerId: z.string({ error: 'Project owner is required' }).trim().min(1, 'Project owner is required'),
  memberIds: z.array(z.string()).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required').optional(),
  description: z.string().trim().optional(),
  startDate: z.coerce.date({ error: 'Invalid start date' }).optional(),
  dueDate: z.coerce.date({ error: 'Invalid due date' }).optional(),
  ownerId: z.string().trim().min(1).optional(),
  memberIds: z.array(z.string()).optional(),
  status: z.enum(PROJECT_STATUSES, { error: 'Invalid project status' }).optional(),
});

// Matches by name or description (see ListService.Project) — free text, so
// only trimmed, never format-validated.
export const listProjectsQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
