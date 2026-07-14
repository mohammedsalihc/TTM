// Plain data shape — decoupled from mongoose.Document (merged in at the
// model<T>() call site instead), same convention as Task/Project. Kept as
// its own collection (not embedded on Task) since a thread can grow and
// deserves its own pagination later.
export interface IComment {
  _id?: string;
  taskId: string; // ref Task
  businessId: string;
  authorId: string; // ref User
  text: string;
  createdAt?: Date;
}
