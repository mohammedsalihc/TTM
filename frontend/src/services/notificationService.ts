import api from './api';
import { Notification, PaginatedResult } from '../types';

export interface ListNotificationsParams {
  page?: number;
  limit?: number;
  // Literal string, not a JS boolean — the backend parses the query param
  // as an enum ('true'|'false'), and Boolean(false) would silently coerce
  // to true since any non-empty string is truthy.
  isRead?: 'true' | 'false';
}

export const listNotificationsRequest = (params: ListNotificationsParams = {}) =>
  api.get<PaginatedResult<Notification>>('/api/notifications', { params }).then((res) => res.data);

export const markNotificationReadRequest = (id: string) =>
  api.patch<Notification>(`/api/notifications/${id}/read`).then((res) => res.data);

export const markAllNotificationsReadRequest = () =>
  api.patch('/api/notifications/read-all').then((res) => res.data);
