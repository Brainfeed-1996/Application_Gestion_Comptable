import { cookies } from 'next/headers';

export function getServerToken(): string | null {
  try {
    const cookieStore = cookies();
    return cookieStore.get('accessToken')?.value || null;
  } catch {
    return null;
  }
}

export function isAuthenticatedServer(): boolean {
  return !!getServerToken();
}
