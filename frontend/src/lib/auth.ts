import { cookies } from 'next/headers';
import { API_BASE_URL } from './constants';

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

export { API_BASE_URL };
