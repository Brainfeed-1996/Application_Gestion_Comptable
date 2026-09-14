"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery, useApiMutation } from "./use-api";
import {
  getTaxes,
  getTaxById,
  createTax,
  updateTax,
  deleteTax,
  setDefaultTax,
} from "@/services/taxes.service";
import type { Tax, TaxCreate, TaxUpdate } from "@/types/tax";

export interface TaxParams {
  page?: number;
  pageSize?: number;
  search?: string;
  country?: string;
  type?: string;
  isActive?: boolean;
}

export function useTaxes(params: TaxParams = {}) {
  const queryParams = {
    page: params.page,
    limit: params.pageSize,
    search: params.search,
    country: params.country,
    type: params.type,
    isActive: params.isActive,
  };

  return useApiQuery<{ items: Tax[]; total: number; page: number; limit: number; totalPages: number }>(
    `taxes-${JSON.stringify(queryParams)}`,
    () => getTaxes(queryParams),
  );
}

export function useTax(id: string) {
  return useApiQuery<Tax>(`tax-${id}`, () => getTaxById(id), { enabled: !!id });
}

export function useCreateTax() {
  const queryClient = useQueryClient();
  return useApiMutation<Tax, TaxCreate>(
    (data) => createTax(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["taxes"] });
      },
    },
  );
}

export function useUpdateTax(id: string) {
  const queryClient = useQueryClient();
  return useApiMutation<Tax, TaxUpdate>(
    (data) => updateTax(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["taxes"] });
      },
    },
  );
}

export function useDeleteTax() {
  const queryClient = useQueryClient();
  return useApiMutation<void, string>(
    (id) => deleteTax(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["taxes"] });
      },
    },
  );
}

export function useSetDefaultTax() {
  const queryClient = useQueryClient();
  return useApiMutation<Tax, string>(
    (id) => setDefaultTax(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["taxes"] });
      },
    },
  );
}