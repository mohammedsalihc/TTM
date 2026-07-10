import { ProjectStatus } from '../types';

export const statusStyles: Record<ProjectStatus, { bar: string; badge: string }> = {
  'On track': { bar: 'bg-indigo-600', badge: 'bg-indigo-50 text-indigo-600' },
  'At risk': { bar: 'bg-amber-500', badge: 'bg-amber-50 text-amber-600' },
  Overdue: { bar: 'bg-red-500', badge: 'bg-red-50 text-red-600' },
};
