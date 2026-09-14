import { apiClient } from "@/lib/api";
import type { Tax, TaxCreate, TaxUpdate } from "@/types/tax";

export async function getTaxes(params?: {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  type?: string;
  isActive?: boolean;
}): Promise<{ items: Tax[]; total: number; page: number; limit: number; totalPages: number }> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.search) searchParams.set("search", params.search);
  if (params?.country) searchParams.set("country", params.country);
  if (params?.type) searchParams.set("type", params.type);
  if (params?.isActive !== undefined) searchParams.set("isActive", String(params.isActive));

  const query = searchParams.toString();
  return apiClient
    .get<{ items: Tax[]; total: number; page: number; limit: number; totalPages: number }>(
      `/taxes${query ? `?${query}` : ""}`,
    )
    .then((r) => r.data);
}

export async function getTaxById(id: string): Promise<Tax> {
  return apiClient.get<Tax>(`/taxes/${id}`).then((r) => r.data);
}

export async function createTax(data: TaxCreate): Promise<Tax> {
  return apiClient.post<Tax>("/taxes", data).then((r) => r.data);
}

export async function updateTax(id: string, data: TaxUpdate): Promise<Tax> {
  return apiClient.put<Tax>(`/taxes/${id}`, data).then((r) => r.data);
}

export async function deleteTax(id: string): Promise<void> {
  await apiClient.delete(`/taxes/${id}`);
}

export async function setDefaultTax(id: string): Promise<Tax> {
  return apiClient.post<Tax>(`/taxes/${id}/default`).then((r) => r.data);
}