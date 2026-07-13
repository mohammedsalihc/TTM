import { z } from 'zod';

// Shared across every "list X" endpoint (Employees now, Managers/Projects/
// Tasks soon) so paging works the same way everywhere.
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
