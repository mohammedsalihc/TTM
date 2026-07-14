import { z } from 'zod';

// { error: '...' } covers the field being entirely absent from the body;
// without it, a missing key fails Zod's base type check first and never
// reaches the .min() message below it (see other validators).
export const createCommentSchema = z.object({
  text: z.string({ error: 'Comment text is required' }).trim().min(1, 'Comment text is required'),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
