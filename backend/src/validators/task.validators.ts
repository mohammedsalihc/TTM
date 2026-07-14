import { z } from 'zod';
import { paginationQuerySchema } from './pagination.validators';
import { TaskPriority, TaskStatus } from '../types';

// { error: '...' } covers the field being entirely absent from the body;
// without it, a missing key fails Zod's base type check first and never
// reaches the .min()/.pipe() message below it (see other validators).
export const createTaskSchema = z.object({
  projectId: z.string({ error: 'Project is required' }).trim().min(1, 'Project is required'),
  title: z.string({ error: 'Task title is required' }).trim().min(1, 'Task title is required'),
  description: z.string().trim().optional(),
  assignedTo: z.array(z.string()).optional(),
  priority: z.enum(TaskPriority, { error: 'Invalid task priority' }).optional(),
  status: z.enum(TaskStatus, { error: 'Invalid task status' }).optional(),
  estimatedHours: z.coerce.number().positive('Estimated hours must be greater than 0').optional(),
  dueDate: z.coerce.date({ error: 'Invalid due date' }).optional(),
  labels: z.array(z.string().trim()).optional(),
});

// Matches by title or description (see ListService.Task) — free text, so
// only trimmed, never format-validated. projectId/status/priority narrow
// the list to a specific project or board column when provided.
export const listTasksQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().optional(),
  projectId: z.string().trim().optional(),
  status: z.enum(TaskStatus, { error: 'Invalid task status' }).optional(),
  priority: z.enum(TaskPriority, { error: 'Invalid task priority' }).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
