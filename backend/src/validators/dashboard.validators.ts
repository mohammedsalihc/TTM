import { z } from 'zod';

// How many trailing months (including the current one) the charts endpoint
// buckets — capped at 12 since this is a dashboard trend view, not a full
// export.
export const dashboardChartsQuerySchema = z.object({
  months: z.coerce.number().int().min(1).max(12).default(6),
});

export type DashboardChartsQuery = z.infer<typeof dashboardChartsQuerySchema>;
