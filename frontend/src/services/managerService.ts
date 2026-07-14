import api from './api';
import { CreateManagerPayload, Manager, PaginatedResult } from '../types';

export interface ListManagersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface UpdateManagerPayload {
  name: string;
  photoUrl?: string;
  canManageProjects?: boolean;
  canManageEmployees?: boolean;
}

export const listManagersRequest = (params: ListManagersParams = {}) =>
  api.get<PaginatedResult<Manager>>('/api/managers', { params }).then((res) => res.data);

export const createManagerRequest = (payload: CreateManagerPayload) =>
  api.post<Manager>('/api/managers', payload).then((res) => res.data);

export const updateManagerRequest = (id: string, payload: UpdateManagerPayload) =>
  api.patch<Manager>(`/api/managers/${id}`, payload).then((res) => res.data);
