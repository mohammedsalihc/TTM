export enum UserRole {
  Admin = 'admin',
  Manager = 'manager',
  Employee = 'employee',
}

// Plain data shapes — decoupled from mongoose.Document (merged in at the
// model<T>() call site instead). User is profile data only; credentials
// live on IAuth in a separate collection (see auth.types.ts).
export interface IUser {
  _id?: string;
  businessId: string;
  name: string;
  email: string;
  role: UserRole;
  designation?: string;
  photoUrl?: string;
  createdAt?: Date;
}

// Shape returned to clients on register/login.
export type PublicUser = Pick<IUser, 'name' | 'email' | 'role' | 'businessId' | 'designation' | 'photoUrl'> & {
  id: string;
};
