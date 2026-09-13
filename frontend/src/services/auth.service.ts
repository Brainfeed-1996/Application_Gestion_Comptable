import { apiClient } from '@/lib/api';
import type { User, UserSession } from '@/types/user';
import { setTokens, clearTokens, setUser } from '@/lib/auth';

export async function authLogin(email: string, password: string): Promise<UserSession> {
  const response = await apiClient.post<{ accessToken: string; refreshToken: string; user: User }>('/auth/login', {
    email,
    password,
  });
  const { accessToken, refreshToken, user } = response.data;
  setTokens(accessToken, refreshToken);
  setUser(user);
  return { accessToken, refreshToken, user };
}

export async function authRegister(data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<UserSession> {
  const response = await apiClient.post<{ accessToken: string; refreshToken: string; user: User }>('/auth/register', data);
  const { accessToken, refreshToken, user } = response.data;
  setTokens(accessToken, refreshToken);
  setUser(user);
  return { accessToken, refreshToken, user };
}

export async function authLogout(): Promise<void> {
  clearTokens();
}

export async function authVerifyTwoFactor(code: string): Promise<UserSession> {
  const response = await apiClient.post<{ accessToken: string; refreshToken: string; user: User }>('/auth/2fa/verify', {
    code,
  });
  const { accessToken, refreshToken, user } = response.data;
  setTokens(accessToken, refreshToken);
  setUser(user);
  return { accessToken, refreshToken, user };
}

export async function authOAuthCallback(token: string): Promise<UserSession> {
  const response = await apiClient.post<{ accessToken: string; refreshToken: string; user: User }>('/auth/oauth/callback', {
    token,
  });
  const { accessToken, refreshToken, user } = response.data;
  setTokens(accessToken, refreshToken);
  setUser(user);
  return { accessToken, refreshToken, user };
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<{ user: User }>('/auth/me');
  return response.data.user;
}
