import api from './api';
import { ActivityLogEntry, PaginatedResult } from '../types';

export interface ListActivityParams {
  page?: number;
  limit?: number;
}

export const listProjectActivityRequest = (projectId: string, params: ListActivityParams = {}) =>
  api.get<PaginatedResult<ActivityLogEntry>>(`/api/projects/${projectId}/activity`, { params }).then((res) => res.data);
