import { UserRole } from './auth';

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  businessId: string;
  designation?: string;
  photoUrl?: string;
  createdAt: string;
}

export interface CreateEmployeePayload {
  name: string;
  email: string;
  password: string;
  designation?: string;
  photoUrl?: string;
  sendEmailInvite?: boolean;
}
