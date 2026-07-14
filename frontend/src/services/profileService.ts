import api from './api';
import { Profile } from '../types';

export const getProfileRequest = () => api.get<Profile>('/api/profile').then((res) => res.data);
