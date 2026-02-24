export type Role = 'admin' | 'superadmin';

export interface User {
  id: number;
  email: string;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
