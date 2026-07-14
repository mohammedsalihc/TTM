import { UserRole } from './auth';

// "Who am I" — fetched once right after login/register from GET
// /api/profile, works for any role. Richer than the auth response's
// `user` object (adds businessName + manager permissions), and is what a
// future role-based UI (show/hide buttons, gate actions) would read from.
export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  businessId: string;
  businessName?: string;
  designation?: string;
  photoUrl?: string;
  canManageProjects?: boolean;
  canManageEmployees?: boolean;
}
