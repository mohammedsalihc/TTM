// What a Mongoose ref field (e.g. Project.ownerId, Task.assignedTo) looks
// like once `.populate()`'d with `'name photoUrl'` — the stored schema type
// stays a plain id (see IProject/ITask), so this is only used for reading
// the populated shape back out when building a response.
export interface PopulatedUserRef {
  _id: string;
  name: string;
  photoUrl?: string;
  role?: string;
}
