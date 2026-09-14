"use client";

import { useCallback, useState } from "react";
import { apiClient } from "@/lib/api";
import type {
  Notification,
  NotificationCreateData,
  NotificationListParams,
} from "@/types/notification";

export function useNotifications() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(
    async (params?: NotificationListParams): Promise<Notification[] | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const searchParams = new URLSearchParams();
        if (params?.is_read !== undefined) searchParams.set("is_read", String(params.is_read));
        if (params?.type) searchParams.set("type", params.type);
        if (params?.page) searchParams.set("page", String(params.page));
        if (params?.limit) searchParams.set("limit", String(params.limit));

        const query = searchParams.toString();
        const response = await apiClient.get<Notification[]>(
          `/notifications${query ? `?${query}` : ""}`,
        );

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

  const getById = useCallback(
    async (id: string): Promise<Notification | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<Notification>(`/notifications/${id}`);
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
    async (data: NotificationCreateData): Promise<Notification | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.post<Notification>("/notifications", data);
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

  const markAsRead = useCallback(
    async (id: string): Promise<Notification | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.put<Notification>(
          `/notifications/${id}/read`,
        );
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
        await apiClient.delete(`/notifications/${id}`);
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
    markAsRead,
    remove,
    isLoading,
    error,
  };
}
