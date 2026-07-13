import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
});

// Backend's requireAuth reads the raw token from Authorization (no "Bearer "
// prefix) — see backend/src/middleware/authMiddleware.ts.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ttm_token');
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

export default api;
