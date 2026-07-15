import api from './api';
import { CreateProjectPayload, PaginatedResult, Project, UpdateProjectPayload } from '../types';

export interface ListProjectsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const listProjectsRequest = (params: ListProjectsParams = {}) =>
  api.get<PaginatedResult<Project>>('/api/projects', { params }).then((res) => res.data);

export const getProjectRequest = (id: string) => api.get<Project>(`/api/projects/${id}`).then((res) => res.data);

export const createProjectRequest = (payload: CreateProjectPayload) =>
  api.post<Project>('/api/projects', payload).then((res) => res.data);

export const updateProjectRequest = (id: string, payload: UpdateProjectPayload) =>
  api.patch<Project>(`/api/projects/${id}`, payload).then((res) => res.data);

export const deleteProjectRequest = (id: string) => api.delete(`/api/projects/${id}`).then((res) => res.data);
