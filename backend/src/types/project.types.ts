// Plain data shape — decoupled from mongoose.Document (merged in at the
// model<T>() call site instead), same convention as User/Business/Auth.
export interface IProject {
  _id?: string;
  businessId: string;
  name: string;
  description?: string;
  startDate?: Date;
  dueDate?: Date;
  ownerId: string; // ref User — must be an Admin or Manager in the same business
  memberIds?: string[]; // ref User[] — employees considered part of the project
  createdBy: string; // ref User — who actually created the record
  createdAt?: Date;
}
