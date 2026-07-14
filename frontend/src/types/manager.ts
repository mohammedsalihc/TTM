import { UserRole } from './auth';

export interface Manager {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  businessId: string;
  photoUrl?: string;
  // Granted by an Admin after creation — a new manager always starts false.
  canManageProjects?: boolean;
  canManageEmployees?: boolean;
}

export interface CreateManagerPayload {
  name: string;
  email: string;
  password: string;
  photoUrl?: string;
  sendEmailInvite?: boolean;
}
