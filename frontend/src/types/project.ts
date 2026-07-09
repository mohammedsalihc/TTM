export type ProjectStatus = 'On track' | 'At risk' | 'Overdue';

export interface ProjectProgress {
  name: string;
  percent: number;
  status: ProjectStatus;
}
