import api from './api';
import { CreateEmployeePayload, Employee, PaginatedResult } from '../types';

export interface ListEmployeesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const listEmployeesRequest = (params: ListEmployeesParams = {}) =>
  api.get<PaginatedResult<Employee>>('/api/employees', { params }).then((res) => res.data);

export const createEmployeeRequest = (payload: CreateEmployeePayload) =>
  api.post<Employee>('/api/employees', payload).then((res) => res.data);
