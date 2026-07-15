// Real lifecycle status from the backend — not the old mock's health
// indicator strings ('On track'/'At risk'/'Overdue'), which still live
// locally in data/projects.ts for Dashboard.tsx's mock "Project Progress"
// section until a real stats endpoint exists.
export type ProjectStatus = 'active' | 'on-hold' | 'completed' | 'cancelled';

// A user reference embedded directly in a Project response — the backend
// populates ownerId/memberIds (Mongoose .populate()) before responding, so
// the frontend never has to resolve raw ids against a separate
// employees/managers list just to show a name.
export interface ProjectPersonRef {
  id: string;
  name: string;
  photoUrl?: string;
}

// Matches backend/src/controllers/projectController.ts's toProjectResponse.
export interface Project {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  startDate?: string;
  dueDate?: string;
  owner?: ProjectPersonRef;
  members: ProjectPersonRef[];
  status: ProjectStatus;
  createdBy: string;
  createdAt: string;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  startDate?: string;
  dueDate?: string;
  ownerId: string;
  memberIds?: string[];
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  startDate?: string;
  dueDate?: string;
  ownerId?: string;
  memberIds?: string[];
  status?: ProjectStatus;
}
