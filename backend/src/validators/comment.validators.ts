import { z } from 'zod';
import { paginationQuerySchema } from './pagination.validators';

// { error: '...' } covers the field being entirely absent from the body;
// without it, a missing key fails Zod's base type check first and never
// reaches the .min() message below it (see other validators).
export const createCommentSchema = z.object({
  text: z.string({ error: 'Comment text is required' }).trim().min(1, 'Comment text is required'),
});

// No extra fields beyond page/limit — comments aren't free-text searched,
// just paginated in chronological order (see ListService.Comment).
export const listCommentsQuerySchema = paginationQuerySchema;

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type ListCommentsQuery = z.infer<typeof listCommentsQuerySchema>;
