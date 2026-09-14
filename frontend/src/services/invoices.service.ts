import { apiClient } from "@/lib/api";
import type { Invoice, InvoiceCreate } from "@/types/invoice";

export async function getInvoices(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
}): Promise<{ items: Invoice[]; total: number; page: number; limit: number; totalPages: number }> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.search) searchParams.set("search", params.search);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.type) searchParams.set("type", params.type);

  const query = searchParams.toString();
  return apiClient
    .get<{ items: Invoice[]; total: number; page: number; limit: number; totalPages: number }>(
      `/invoices${query ? `?${query}` : ""}`,
    )
    .then((r) => r.data);
}

export async function getInvoiceById(id: string): Promise<Invoice> {
  return apiClient.get<Invoice>(`/invoices/${id}`).then((r) => r.data);
}

export async function createInvoice(data: InvoiceCreate): Promise<Invoice> {
  return apiClient.post<Invoice>("/invoices", data).then((r) => r.data);
}

export async function updateInvoice(id: string, data: InvoiceCreate): Promise<Invoice> {
  return apiClient.put<Invoice>(`/invoices/${id}`, data).then((r) => r.data);
}

export async function deleteInvoice(id: string): Promise<void> {
  await apiClient.delete(`/invoices/${id}`);
}

export async function sendInvoice(id: string): Promise<Invoice> {
  return apiClient.post<Invoice>(`/invoices/${id}/send`).then((r) => r.data);
}

export async function payInvoice(id: string): Promise<Invoice> {
  return apiClient.post<Invoice>(`/invoices/${id}/pay`).then((r) => r.data);
}

export async function cancelInvoice(id: string): Promise<Invoice> {
  return apiClient.post<Invoice>(`/invoices/${id}/cancel`).then((r) => r.data);
}
