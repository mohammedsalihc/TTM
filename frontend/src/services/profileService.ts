import api from './api';
import { ChangePasswordPayload, Profile, UpdateProfilePayload } from '../types';

export const getProfileRequest = () => api.get<Profile>('/api/profile').then((res) => res.data);

export const updateProfileRequest = (payload: UpdateProfilePayload) =>
  api.patch<Profile>('/api/profile', payload).then((res) => res.data);

export const changePasswordRequest = (payload: ChangePasswordPayload) =>
  api.patch('/api/profile/password', payload).then((res) => res.data);
