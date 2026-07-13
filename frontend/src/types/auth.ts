export enum UserRole {
  Admin = 'admin',
  Manager = 'manager',
  Employee = 'employee',
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  businessId: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterPayload {
  businessName: string;
  fullName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// Shape of every error response returned by the backend's ControllerHandler.
export interface ApiErrorResponse {
  status: number;
  message: string;
  error_message_code: string;
  error?: unknown[];
}
