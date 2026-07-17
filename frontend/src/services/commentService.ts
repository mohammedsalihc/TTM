import api from './api';
import { Comment, CreateCommentPayload, PaginatedResult } from '../types';

export interface ListCommentsParams {
  page?: number;
  limit?: number;
}

export const listCommentsRequest = (taskId: string, params: ListCommentsParams = {}) =>
  api.get<PaginatedResult<Comment>>(`/api/tasks/${taskId}/comments`, { params }).then((res) => res.data);

export const createCommentRequest = (taskId: string, payload: CreateCommentPayload) =>
  api.post<Comment>(`/api/tasks/${taskId}/comments`, payload).then((res) => res.data);
