import api from './api';

export interface DashboardStats {
  totalEmployees: number;
  totalManagers: number;
  totalProjects: number;
  totalTasks: number;
}

export interface DashboardMonthlyBucket {
  label: string;
  employees: number;
  managers: number;
  projects: number;
}

export interface DashboardCharts {
  months: DashboardMonthlyBucket[];
}

export const getDashboardStatsRequest = () =>
  api.get<DashboardStats>('/api/dashboard/stats').then((res) => res.data);

export const getDashboardChartsRequest = (months = 6) =>
  api.get<DashboardCharts>('/api/dashboard/charts', { params: { months } }).then((res) => res.data);
