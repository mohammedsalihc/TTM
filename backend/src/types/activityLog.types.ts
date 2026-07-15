// Plain data shape — decoupled from mongoose.Document (merged in at the
// model<T>() call site instead), same convention as Task/Project. Append-
// only audit trail: written as a side-effect from other controllers via
// utils/activityLogService.ts, never created directly through an endpoint.
export interface IActivityLog {
  _id?: string;
  businessId: string;
  projectId: string;
  taskId?: string;
  actorId: string; // ref User — who performed the action
  message: string; // pre-rendered human string, e.g. `Salih created project "Website Revamp"`
  createdAt?: Date;
}
