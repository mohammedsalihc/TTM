import api from './api';
import { CreateEmployeePayload, Employee, PaginatedResult } from '../types';

export interface ListEmployeesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface UpdateEmployeePayload {
  name: string;
  designation?: string;
  photoUrl?: string;
}

export const listEmployeesRequest = (params: ListEmployeesParams = {}) =>
  api.get<PaginatedResult<Employee>>('/api/employees', { params }).then((res) => res.data);

export const getEmployeeRequest = (id: string) => api.get<Employee>(`/api/employees/${id}`).then((res) => res.data);

export const createEmployeeRequest = (payload: CreateEmployeePayload) =>
  api.post<Employee>('/api/employees', payload).then((res) => res.data);

export const updateEmployeeRequest = (id: string, payload: UpdateEmployeePayload) =>
  api.patch<Employee>(`/api/employees/${id}`, payload).then((res) => res.data);
