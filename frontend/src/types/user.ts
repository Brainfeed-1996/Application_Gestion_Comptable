export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserRegister {
  name: string;
  email: string;
  password: string;
}

export interface UserResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  siren?: string;
  naf?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  accessToken: string;
  refreshToken: string;
  user: User;
}
