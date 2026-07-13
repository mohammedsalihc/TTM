// Plain data shape — kept decoupled from mongoose.Document. The model file
// merges Document in at the model<T>() call site instead, so this interface
// stays reusable anywhere (DTOs, service filters, etc.) without dragging
// Mongoose-specific methods along with it.
export interface IBusiness {
  _id?: string;
  name: string;
  createdAt?: Date;
}
