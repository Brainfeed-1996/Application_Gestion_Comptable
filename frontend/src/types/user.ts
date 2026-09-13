export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

export type UserRole = 'admin' | 'accountant' | 'viewer' | 'client';

export interface UserSession {
  accessToken: string;
  refreshToken: string;
  user: User;
}
