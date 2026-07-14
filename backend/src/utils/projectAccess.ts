import { Request } from 'express';
import { DetailService } from '../services/detailService';
import { UserRole, IProject } from '../types';

const detail_service = new DetailService();

// Whether the caller can manage projects/tasks *in general* (used for
// create, where there's no existing project to check ownership against
// yet). Admin always can; a Manager can only if their canManageProjects
// permission is currently true — re-checked live from the DB rather than
// trusted from the JWT, since it can change after the token was issued
// (same reasoning as /api/profile always re-reading it fresh).
export async function hasProjectManagementPermission(req: Request): Promise<boolean> {
  if (req.role === UserRole.Admin) return true;
  if (req.role !== UserRole.Manager) return false;

  const manager = await detail_service.User({ _id: req.userId });
  return manager?.canManageProjects === true;
}

// Whether the caller owns this specific project — Managers can only
// manage projects they own, not any project in the business.
export function isProjectOwner(req: Request, project: IProject): boolean {
  return project.ownerId.toString() === req.userId;
}

// Combined check for update/delete on an existing project (or a task
// belonging to one): Admin always passes; a Manager must both own the
// project and currently hold the permission.
export async function canManageProject(req: Request, project: IProject): Promise<boolean> {
  if (req.role === UserRole.Admin) return true;
  return isProjectOwner(req, project) && (await hasProjectManagementPermission(req));
}
