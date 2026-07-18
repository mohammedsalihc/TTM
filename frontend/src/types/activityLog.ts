// Matches backend/src/controllers/projectController.ts's activity endpoint —
// `message` is pre-rendered plain text that already includes the actor's
// name (e.g. "Salih created project \"Website Revamp\""), so no id→name
// resolution is needed on the frontend.
export interface ActivityLogEntry {
  id: string;
  projectId: string;
  taskId?: string;
  actorId: string;
  message: string;
  createdAt: string;
}
