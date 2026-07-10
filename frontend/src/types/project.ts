export type ProjectStatus = 'On track' | 'At risk' | 'Overdue';

export interface Project {
  id: string;
  name: string;
  description: string;
  manager: string;
  employees: string[];
  percent: number;
  status: ProjectStatus;
  deadline: string;
}
