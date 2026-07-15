import { z } from 'zod';
import { paginationQuerySchema } from './pagination.validators';

// z.coerce.boolean() is a trap for query strings — Boolean("false") is
// `true` in JS since any non-empty string is truthy, so ?isRead=false would
// silently coerce to true. Parse the literal string instead.
const booleanQueryParam = z
  .enum(['true', 'false'], { error: 'Must be "true" or "false"' })
  .transform((value) => value === 'true');

// isRead lets the client ask for just the unread ones (e.g. a bell-icon
// badge count) or the full feed when omitted.
export const listNotificationsQuerySchema = paginationQuerySchema.extend({
  isRead: booleanQueryParam.optional(),
});

export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;
