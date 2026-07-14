import { Request } from 'express';
import { UserRole, ITask } from '../types';

// Whether the caller can see this task at all (detail, comments) — Admin/
// Manager see every business task (coordination visibility, same as
// projects); an Employee only sees tasks they're assigned to.
export function canViewTask(req: Request, task: ITask): boolean {
  if (req.role !== UserRole.Employee) return true;
  return (task.assignedTo ?? []).some((userId) => userId.toString() === req.userId);
}
