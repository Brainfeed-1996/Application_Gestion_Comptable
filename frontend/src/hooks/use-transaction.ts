"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import type { Transaction, TransactionCreate } from "@/types/transaction";

export function useTransaction(id: string | undefined) {
  const [data, setData] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransaction = useCallback(async (): Promise<Transaction | null> => {
    if (!id) {
      setData(null);
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<Transaction>(`/transactions/${id}`);
      setData(response.data);
      return response.data;
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setData(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchTransaction();
  }, [fetchTransaction]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchTransaction,
  };
}

export function useUpdateTransaction(id: string | undefined) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback(
    async (data: TransactionCreate | Partial<TransactionCreate>): Promise<Transaction | null> => {
      if (!id) {
        const missingIdError = new Error("Transaction ID is required");
        setError(missingIdError);
        return null;
      }

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
    [id],
  );

  return {
    update,
    isLoading,
    error,
  };
}

export function useDeleteTransaction(id: string | undefined) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const remove = useCallback(async (): Promise<void | null> => {
    if (!id) {
      const missingIdError = new Error("Transaction ID is required");
      setError(missingIdError);
      return null;
    }

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
  }, [id]);

  return {
    remove,
    isLoading,
    error,
  };
}
