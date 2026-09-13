import { API_BASE_URL } from '@/lib/constants';
import type { ApiError, ApiResponse } from '@/types/api';

class ApiService {
  private baseURL: string;
  private defaultTimeout: number = 10000;

  constructor(baseURL: string) {
    this.baseURL = baseURL || API_BASE_URL;
  }

  private getHeaders(): Record<string, string> {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private getToken(): string | null {
    try {
      return localStorage.getItem('accessToken');
    } catch {
      return null;
    }
  }

  private async request<T>(config: RequestInit & { url: string }): Promise<T> {
    const url = `${this.baseURL}${config.url}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);

    try {
      const response = await fetch(url, {
        ...config,
        headers: {
          ...this.getHeaders(),
          ...config.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 401) {
        this.handleUnauthorized();
      }

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          code: 'UNKNOWN',
          message: 'Erreur inconnue',
          status: response.status,
        }));
        console.error(`API Error ${response.status}:`, errorData);
        throw new Error(errorData.message);
      }

      const data: ApiResponse<T> = await response.json();
      return data.data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Requête expirée');
      }
      throw error;
    }
  }

  private handleUnauthorized(): void {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } catch {}
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  async get<T>(url: string, config?: RequestInit): Promise<T> {
    return this.request<T>({ url, method: 'GET', ...config });
  }

  async post<T>(url: string, data?: unknown, config?: RequestInit): Promise<T> {
    return this.request<T>({
      url,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });
  }

  async put<T>(url: string, data?: unknown, config?: RequestInit): Promise<T> {
    return this.request<T>({
      url,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });
  }

  async patch<T>(url: string, data?: unknown, config?: RequestInit): Promise<T> {
    return this.request<T>({
      url,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });
  }

  async delete<T>(url: string, config?: RequestInit): Promise<T> {
    return this.request<T>({ url, method: 'DELETE', ...config });
  }
}

export const apiService = new ApiService(API_BASE_URL);
