export enum TaskPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical',
}

export enum TaskStatus {
  Todo = 'todo',
  InProgress = 'in-progress',
  Completed = 'completed',
}

// Plain data shape — decoupled from mongoose.Document (merged in at the
// model<T>() call site instead), same convention as Project/User/Business.
export interface ITask {
  _id?: string;
  businessId: string;
  projectId: string; // ref Project — task always belongs to exactly one project
  title: string;
  description?: string;
  assignedTo?: string[]; // ref User[] — employees this task is assigned to
  priority?: TaskPriority; // Mongoose applies the schema default ('medium') when omitted
  status?: TaskStatus; // Mongoose applies the schema default ('todo') when omitted
  estimatedHours?: number;
  dueDate?: Date;
  labels?: string[];
  createdBy: string; // ref User — who actually created the record
  createdAt?: Date;
}
