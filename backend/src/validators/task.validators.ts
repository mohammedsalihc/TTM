import { z } from 'zod';
import { paginationQuerySchema } from './pagination.validators';
import { isNotPastDate, PAST_DATE_MESSAGE } from './dateRules';
import { TaskPriority, TaskStatus } from '../types';

// { error: '...' } covers the field being entirely absent from the body;
// without it, a missing key fails Zod's base type check first and never
// reaches the .min()/.pipe() message below it (see other validators).
export const createTaskSchema = z.object({
  projectId: z.string({ error: 'Project is required' }).trim().min(1, 'Project is required'),
  title: z.string({ error: 'Task title is required' }).trim().min(1, 'Task title is required'),
  description: z.string().trim().optional(),
  // A task must be assigned to at least one employee up front — the
  // frontend's Add Task form enforces this too, but the API shouldn't rely
  // on that alone.
  assignedTo: z
    .array(z.string(), { error: 'At least one assignee is required' })
    .min(1, 'At least one assignee is required'),
  priority: z.enum(TaskPriority, { error: 'Invalid task priority' }).optional(),
  status: z.enum(TaskStatus, { error: 'Invalid task status' }).optional(),
  estimatedHours: z
    .coerce.number({ error: 'Estimated hours is required' })
    .positive('Estimated hours must be greater than 0'),
  dueDate: z.coerce.date({ error: 'Invalid due date' }).refine(isNotPastDate, PAST_DATE_MESSAGE).optional(),
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

// All fields optional — this is a partial update (see the updateProjectSchema
// bug fix: requiring a field like title here would break status/priority-only
// PATCHes).
export const updateTaskSchema = z.object({
  title: z.string().trim().min(1, 'Task title is required').optional(),
  description: z.string().trim().optional(),
  assignedTo: z.array(z.string()).optional(),
  priority: z.enum(TaskPriority, { error: 'Invalid task priority' }).optional(),
  status: z.enum(TaskStatus, { error: 'Invalid task status' }).optional(),
  estimatedHours: z.coerce.number().positive('Estimated hours must be greater than 0').optional(),
  dueDate: z.coerce.date({ error: 'Invalid due date' }).refine(isNotPastDate, PAST_DATE_MESSAGE).optional(),
  labels: z.array(z.string().trim()).optional(),
});

// Separate from updateTaskSchema — the status-only endpoint is also open to
// the task's assigned employees (not just Admin/owning Manager), so it's
// validated and authorized independently of the full update.
export const updateTaskStatusSchema = z.object({
  status: z.enum(TaskStatus, { error: 'Invalid task status' }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
