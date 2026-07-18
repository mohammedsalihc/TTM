import { UserRole } from './user.types';

export interface JwtPayload {
  userId: string;
  businessId: string;
  role: UserRole;
}

// Plain data shape for the Auth collection — holds credentials, separate
// from IUser (profile data). Decoupled from mongoose.Document; merged in at
// the model<T>() call site.
export interface IAuth {
  _id?: string;
  businessId: string;
  user: string; // ref User._id
  email: string;
  passwordHash: string;
  role: UserRole;
  // Set by POST /api/auth/forgot-password, consumed (and cleared) by
  // POST /api/auth/reset-password — resetTokenHash is a sha256 of the raw
  // token emailed to the user, never the raw token itself.
  resetTokenHash?: string;
  resetTokenExpiresAt?: Date;
  createdAt?: Date;
}
