import { TaskPriority, TaskStatus } from '../types';

export const taskStatusStyles: Record<TaskStatus, { badge: string; label: string }> = {
  todo: { badge: 'bg-gray-100 text-gray-600', label: 'To Do' },
  'in-progress': { badge: 'bg-amber-50 text-amber-600', label: 'In Progress' },
  completed: { badge: 'bg-emerald-50 text-emerald-600', label: 'Completed' },
};

export const taskPriorityStyles: Record<TaskPriority, { badge: string; label: string }> = {
  low: { badge: 'bg-gray-100 text-gray-600', label: 'Low' },
  medium: { badge: 'bg-blue-50 text-blue-600', label: 'Medium' },
  high: { badge: 'bg-orange-50 text-orange-600', label: 'High' },
  critical: { badge: 'bg-red-50 text-red-600', label: 'Critical' },
};

// Solid dot color for column headers — same 3 statuses as taskStatusStyles,
// just a filled swatch instead of a text/bg pill.
export const taskStatusDotStyles: Record<TaskStatus, string> = {
  todo: 'bg-gray-400',
  'in-progress': 'bg-amber-500',
  completed: 'bg-emerald-500',
};
