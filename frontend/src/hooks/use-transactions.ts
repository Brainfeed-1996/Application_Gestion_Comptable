"use client";

import { useCallback, useState } from "react";
import { apiClient } from "@/lib/api";
import type { Transaction, TransactionCreate } from "@/types/transaction";
import type { PaginatedResponse } from "@/types/transaction";

export interface TransactionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  categoryId?: string;
  accountId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useTransactions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(
    async (params?: TransactionQueryParams): Promise<PaginatedResponse<Transaction> | null> => {
      setIsLoading(true);
      setError(null);
      try {
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
        const response = await apiClient.get<Transaction[]>(
          `/transactions${query ? `?${query}` : ""}`,
        );

        return {
          items: response.data,
          total: response.data.length,
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
          totalPages: 1,
        };
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const getById = useCallback(
    async (id: string): Promise<Transaction | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<Transaction>(`/transactions/${id}`);
        return response.data;
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const create = useCallback(
    async (data: TransactionCreate): Promise<Transaction | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.post<Transaction>("/transactions", data);
        return response.data;
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const update = useCallback(
    async (
      id: string,
      data: Partial<TransactionCreate>,
    ): Promise<Transaction | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.put<Transaction>(`/transactions/${id}`, data);
        return response.data;
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const remove = useCallback(
    async (id: string): Promise<void | null> => {
      setIsLoading(true);
      setError(null);
      try {
        await apiClient.delete(`/transactions/${id}`);
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    fetchAll,
    getById,
    create,
    update,
    remove,
    isLoading,
    error,
  };
}

export function useTransaction(id: string | undefined) {
  const [data, setData] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransaction = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<Transaction>(`/transactions/${id}`);
      setData(response.data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  return { data, isLoading, error, refetch: fetchTransaction };
}
