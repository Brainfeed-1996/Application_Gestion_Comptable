import { apiClient } from "@/lib/api";
import type { Transaction, TransactionCreate, PaginatedResponse } from "@/types/transaction";

export async function getTransactions(params?: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  categoryId?: string;
  accountId?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<PaginatedResponse<Transaction>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.search) searchParams.set("search", params.search);
  if (params?.type) searchParams.set("type", params.type);
  if (params?.categoryId) searchParams.set("categoryId", params.categoryId);
  if (params?.accountId) searchParams.set("accountId", params.accountId);
  if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom);
  if (params?.dateTo) searchParams.set("dateTo", params.dateTo);

  const query = searchParams.toString();
  return apiClient
    .get<{ items: Transaction[]; total: number; page: number; limit: number; totalPages: number }>(
      `/transactions${query ? `?${query}` : ""}`,
    )
    .then((r) => ({
      items: r.data,
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    }));
}

export async function getTransactionById(id: string): Promise<Transaction> {
  return apiClient.get<Transaction>(`/transactions/${id}`).then((r) => r.data);
}

export async function createTransaction(data: TransactionCreate): Promise<Transaction> {
  return apiClient.post<Transaction>("/transactions", data).then((r) => r.data);
}

export async function updateTransaction(id: string, data: Partial<TransactionCreate>): Promise<Transaction> {
  return apiClient.put<Transaction>(`/transactions/${id}`, data).then((r) => r.data);
}

export async function deleteTransaction(id: string): Promise<void> {
  await apiClient.delete(`/transactions/${id}`);
}

export async function reconcileTransaction(id: string): Promise<Transaction> {
  return apiClient.post<Transaction>(`/transactions/${id}/reconcile`).then((r) => r.data);
}
