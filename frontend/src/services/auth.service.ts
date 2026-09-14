import { apiClient } from "@/lib/api";
import { setTokens, clearTokens, setUser } from "@/lib/auth";
import type { UserLogin, UserRegister, UserSession } from "@/types/user";

export async function authLogin(email: string, password: string): Promise<UserSession> {
  const response = await apiClient.post<{ accessToken: string; refreshToken: string; user: UserSession["user"] }>(
    "/auth/login",
    { email, password },
  );
  const { accessToken, refreshToken, user } = response.data;
  setTokens(accessToken, refreshToken);
  setUser(user);
  return { accessToken, refreshToken, user };
}

export async function authRegister(data: UserRegister): Promise<UserSession> {
  const response = await apiClient.post<{ accessToken: string; refreshToken: string; user: UserSession["user"] }>(
    "/auth/register",
    data,
  );
  const { accessToken, refreshToken, user } = response.data;
  setTokens(accessToken, refreshToken);
  setUser(user);
  return { accessToken, refreshToken, user };
}

export async function authLogout(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } catch {
    // ignore
  }
  clearTokens();
}

export async function getCurrentUser() {
  const response = await apiClient.get<{ user: UserSession["user"] }>("/auth/me");
  return response.data.user;
}

export async function authVerifyTwoFactor(email: string, code: string): Promise<UserSession> {
  const response = await apiClient.post<{ accessToken: string; refreshToken: string; user: UserSession["user"] }>(
    "/auth/2fa/verify",
    { email, code },
  );
  const { accessToken, refreshToken, user } = response.data;
  setTokens(accessToken, refreshToken);
  setUser(user);
  return { accessToken, refreshToken, user };
}

export async function authOAuth(provider: string, code: string): Promise<UserSession> {
  const response = await apiClient.post<{ accessToken: string; refreshToken: string; user: UserSession["user"] }>(
    "/auth/oauth/callback",
    { provider, code },
  );
  const { accessToken, refreshToken, user } = response.data;
  setTokens(accessToken, refreshToken);
  setUser(user);
  return { accessToken, refreshToken, user };
}

export function getAccessToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
}

export const authService = {
  login: authLogin,
  register: authRegister,
  logout: authLogout,
  getMe: getCurrentUser,
  verifyTwoFactor: authVerifyTwoFactor,
  oauth: authOAuth,
  getToken: getAccessToken,
};
