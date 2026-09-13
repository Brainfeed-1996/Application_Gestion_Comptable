import { apiClient } from '@/lib/api';
import type { Client } from '@/types/user';

export interface ClientFull {
  id: string;
  name: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  vatNumber: string;
  siret: string;
  phone?: string;
  balance: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export async function getClients(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<{ items: ClientFull[]; total: number; page: number; limit: number; totalPages: number }> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.search) searchParams.set('search', params.search);
  if (params?.status) searchParams.set('status', params.status);

  const query = searchParams.toString();
  return apiClient.get<{ items: ClientFull[]; total: number; page: number; limit: number; totalPages: number }>(
    `/clients${query ? `?${query}` : ''}`
  ).then(r => r.data);
}

export async function getClientById(id: string): Promise<ClientFull> {
  return apiClient.get<ClientFull>(`/clients/${id}`).then(r => r.data);
}

export async function createClient(data: Omit<ClientFull, 'id' | 'balance' | 'status' | 'createdAt'>): Promise<ClientFull> {
  return apiClient.post<ClientFull>('/clients', data).then(r => r.data);
}

export async function updateClient(id: string, data: Partial<ClientFull>): Promise<ClientFull> {
  return apiClient.put<ClientFull>(`/clients/${id}`, data).then(r => r.data);
}

export async function deleteClient(id: string): Promise<void> {
  await apiClient.delete(`/clients/${id}`);
}
