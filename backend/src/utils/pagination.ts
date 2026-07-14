import { PaginationMeta } from '../types';

// Shared by every "list X" endpoint's response — page/limit are just
// echoed back, only totalPages needs computing.
export const buildPaginationMeta = (total: number, page: number, limit: number): PaginationMeta => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});
