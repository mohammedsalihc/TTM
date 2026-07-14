export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  projects: string[];
  designation?: string;
  photoUrl?: string;
  // Manager-only permissions, granted by an Admin after creation.
  canManageProjects?: boolean;
  canManageEmployees?: boolean;
}
