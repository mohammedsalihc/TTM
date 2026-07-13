import api from './api';
import { AuthResponse, LoginPayload, RegisterPayload } from '../types';

export const registerRequest = (payload: RegisterPayload) =>
  api.post<AuthResponse>('/api/auth/register', payload).then((res) => res.data);

export const loginRequest = (payload: LoginPayload) =>
  api.post<AuthResponse>('/api/auth/login', payload).then((res) => res.data);
