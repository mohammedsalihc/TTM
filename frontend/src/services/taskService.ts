import api from './api';
import { CreateTaskPayload, PaginatedResult, Task, TaskPriority, TaskStatus, UpdateTaskPayload } from '../types';

export interface ListTasksParams {
  page?: number;
  limit?: number;
  search?: string;
  projectId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export const listTasksRequest = (params: ListTasksParams = {}) =>
  api.get<PaginatedResult<Task>>('/api/tasks', { params }).then((res) => res.data);

export const getTaskRequest = (id: string) => api.get<Task>(`/api/tasks/${id}`).then((res) => res.data);

export const createTaskRequest = (payload: CreateTaskPayload) =>
  api.post<Task>('/api/tasks', payload).then((res) => res.data);

export const updateTaskRequest = (id: string, payload: UpdateTaskPayload) =>
  api.patch<Task>(`/api/tasks/${id}`, payload).then((res) => res.data);

// Separate endpoint from the full update above — also open to an employee
// assigned to the task, not just the project's owner (see backend
// taskController.updateStatus).
export const updateTaskStatusRequest = (id: string, status: TaskStatus) =>
  api.patch<Task>(`/api/tasks/${id}/status`, { status }).then((res) => res.data);

export const deleteTaskRequest = (id: string) => api.delete(`/api/tasks/${id}`).then((res) => res.data);
