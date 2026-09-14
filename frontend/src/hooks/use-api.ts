"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useApi<T>() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (fn: () => Promise<T>): Promise<T | null> => {
      setIsLoading(true);
      setError(null);
      try {
        return await fn();
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { execute, isLoading, error };
}

export function useLoading() {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const startLoading = useCallback((key: string) => setLoadingKey(key), []);
  const stopLoading = useCallback(() => setLoadingKey(null), []);
  const isLoading = useCallback((key: string) => loadingKey === key, [loadingKey]);
  return { startLoading, stopLoading, isLoading, loadingKey };
}

export function useApiQuery<T>(
  queryKey: string | readonly unknown[],
  queryFn: () => Promise<T>,
  options?: Record<string, unknown>
) {
  return useQuery<T>({
    queryKey,
    queryFn,
    ...(options || {}),
  });
}

export function useApiMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Record<string, unknown>
) {
  const queryClient = useQueryClient();
  return useMutation<TData, Error, TVariables>({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    ...(options || {}),
  });
}

export function useAppQuery() {
  return useQueryClient();
}
