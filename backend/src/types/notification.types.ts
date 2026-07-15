export enum NotificationType {
  TaskAssigned = 'task-assigned',
}

// Plain data shape — decoupled from mongoose.Document (merged in at the
// model<T>() call site instead), same convention as Task/Project. Written
// only as a side-effect from other controllers (e.g. task assignment) —
// there's no manual "create notification" endpoint, only reads.
export interface INotification {
  _id?: string;
  businessId: string;
  userId: string; // ref User — the recipient
  message: string;
  type: NotificationType;
  relatedProjectId?: string;
  relatedTaskId?: string;
  isRead?: boolean; // Mongoose applies the schema default (false) when omitted
  createdAt?: Date;
}
