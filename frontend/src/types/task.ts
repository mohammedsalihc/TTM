import { ProjectPersonRef } from './project';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'todo' | 'in-progress' | 'completed';

// Matches backend/src/controllers/taskController.ts's toTaskResponse.
// assignedTo is populated (name+photo) same as Project's owner/members.
export interface Task {
  id: string;
  businessId: string;
  projectId: string;
  title: string;
  description?: string;
  assignedTo: ProjectPersonRef[];
  priority: TaskPriority;
  status: TaskStatus;
  estimatedHours?: number;
  dueDate?: string;
  labels: string[];
  createdBy: string;
  createdAt: string;
}

export interface CreateTaskPayload {
  projectId: string;
  title: string;
  description?: string;
  assignedTo: string[];
  priority?: TaskPriority;
  estimatedHours: number;
  labels?: string[];
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  assignedTo?: string[];
  priority?: TaskPriority;
  dueDate?: string;
  estimatedHours?: number;
  labels?: string[];
}
