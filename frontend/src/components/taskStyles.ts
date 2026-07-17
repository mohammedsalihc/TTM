import { TaskPriority, TaskStatus } from '../types';

export const taskStatusStyles: Record<TaskStatus, { label: string }> = {
  todo: { label: 'To Do' },
  'in-progress': { label: 'In Progress' },
  completed: { label: 'Completed' },
};

export const taskPriorityStyles: Record<TaskPriority, { badge: string; label: string }> = {
  low: { badge: 'bg-gray-100 text-gray-600', label: 'Low' },
  medium: { badge: 'bg-blue-50 text-blue-600', label: 'Medium' },
  high: { badge: 'bg-orange-50 text-orange-600', label: 'High' },
  critical: { badge: 'bg-red-50 text-red-600', label: 'Critical' },
};
