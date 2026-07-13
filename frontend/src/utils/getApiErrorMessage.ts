import axios from 'axios';
import { ApiErrorResponse } from '../types';

export const getApiErrorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError<ApiErrorResponse>(err) && err.response?.data?.message) {
    return err.response.data.message;
  }
  return fallback;
};
