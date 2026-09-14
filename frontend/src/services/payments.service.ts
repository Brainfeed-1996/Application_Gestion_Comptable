import { apiClient } from "@/lib/api";
import type { Payment, PaymentCreate } from "@/types/payment";

export async function getPayments(params?: {
  page?: number;
  limit?: number;
  status?: string;
  method?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<{
  items: Payment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.status) searchParams.set("status", params.status);
  if (params?.method) searchParams.set("method", params.method);
  if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom);
  if (params?.dateTo) searchParams.set("dateTo", params.dateTo);

  const query = searchParams.toString();
  return apiClient
    .get<{
      items: Payment[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/payments${query ? `?${query}` : ""}`)
    .then((r) => r.data);
}

export async function getPaymentById(id: string): Promise<Payment> {
  return apiClient.get<Payment>(`/payments/${id}`).then((r) => r.data);
}

export async function createPayment(data: PaymentCreate): Promise<Payment> {
  return apiClient.post<Payment>("/payments", data).then((r) => r.data);
}

export async function updatePayment(
  id: string,
  data: Partial<PaymentCreate>
): Promise<Payment> {
  return apiClient.put<Payment>(`/payments/${id}`, data).then((r) => r.data);
}

export async function deletePayment(id: string): Promise<void> {
  await apiClient.delete(`/payments/${id}`);
}