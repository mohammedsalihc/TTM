import { ProjectStatus } from '../types';

export const statusStyles: Record<ProjectStatus, { bar: string; badge: string; label: string }> = {
  active: { bar: 'bg-indigo-600', badge: 'bg-indigo-50 text-indigo-600', label: 'Active' },
  'on-hold': { bar: 'bg-amber-500', badge: 'bg-amber-50 text-amber-600', label: 'On Hold' },
  completed: { bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-600', label: 'Completed' },
  cancelled: { bar: 'bg-red-500', badge: 'bg-red-50 text-red-600', label: 'Cancelled' },
};
