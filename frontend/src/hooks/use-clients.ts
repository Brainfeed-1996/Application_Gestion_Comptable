"use client";

import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery, useApiMutation } from "./use-api";
import { getClients } from "@/services/clients.service";
import type { ClientFull } from "@/services/clients.service";
import { useDebounce } from "./use-debounce";

export interface ClientParams {
  page?: number;
  pageSize?: number;
  search?: string;
  city?: string;
  country?: string;
}

export function useClients(params: ClientParams) {
  const debouncedSearch = useDebounce(params.search || "", 300);

  const queryParams = useMemo(
    () => ({
      ...params,
      search: debouncedSearch,
    }),
    [params, debouncedSearch],
  );

  return useApiQuery<{ items: ClientFull[]; total: number; page: number; limit: number; totalPages: number }>(
    `clients-${JSON.stringify(queryParams)}`,
    () => getClients(queryParams),
  );
}

export function useClient(id: string) {
  return useApiQuery<ClientFull>(`client-${id}`, () => {
    return import("@/services/clients.service").then((m) => m.getClientById(id));
  }, { enabled: !!id });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useApiMutation<ClientFull, Omit<ClientFull, "id" | "balance" | "status" | "createdAt">>(
    (data) => {
      return import("@/services/clients.service").then((m) => m.createClient(data));
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["clients"] });
        console.log("Client créé");
      },
    },
  );
}

export function useUpdateClient(id: string) {
  const queryClient = useQueryClient();
  return useApiMutation<ClientFull, Partial<ClientFull>>(
    (data) => {
      return import("@/services/clients.service").then((m) => m.updateClient(id, data));
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["clients"] });
        console.log("Client mis à jour");
      },
    },
  );
}

export function useDeleteClient(id: string) {
  const queryClient = useQueryClient();
  return useApiMutation<void, string>(
    () => {
      return import("@/services/clients.service").then((m) => m.deleteClient(id));
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["clients"] });
        console.log("Client supprimé");
      },
    },
  );
}
