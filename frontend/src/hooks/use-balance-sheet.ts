"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export interface BalanceSheetTemplate {
  id: string;
  name: string;
  description?: string;
  sections: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BalanceSheetDraft {
  id: string;
  name: string;
  templateId?: string;
  status: "draft" | "calculated" | "finalized";
  createdAt: string;
  updatedAt: string;
}

export interface BalanceSheetCalculation {
  id: string;
  assets: number;
  liabilities: number;
  equity: number;
  ratios?: Record<string, number>;
  rows?: { label: string; value: number }[];
  calculatedAt: string;
}

export interface BalanceSheetQuickCreate {
  name?: string;
  period?: string;
  date?: string;
}

export interface BalanceSheetDraftUpdate {
  name?: string;
  [key: string]: unknown;
}

export function useBalanceSheetTemplates() {
  return useQuery<BalanceSheetTemplate[]>({
    queryKey: ["balance-sheet-templates"],
    queryFn: () =>
      apiClient
        .get<BalanceSheetTemplate[]>("/balance-sheet/templates")
        .then((r) => r.data),
  });
}

export function useBalanceSheetDrafts() {
  return useQuery<BalanceSheetDraft[]>({
    queryKey: ["balance-sheet-drafts"],
    queryFn: () =>
      apiClient
        .get<BalanceSheetDraft[]>("/balance-sheet/drafts")
        .then((r) => r.data),
  });
}

export function useCreateQuickBilan() {
  const queryClient = useQueryClient();
  return useMutation<BalanceSheetCalculation, Error, BalanceSheetQuickCreate>({
    mutationFn: (data) =>
      apiClient
        .post<BalanceSheetCalculation>("/balance-sheet/quick", data)
        .then((r) => r.data),
    onSuccess: (data) => {
      queryClient.setQueryData(["balance-sheet-calculation", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["balance-sheet-drafts"] });
      console.log("Bilan rapide créé");
    },
  });
}

export function useBalanceSheetCalculation(draftId: string | undefined) {
  return useQuery<BalanceSheetCalculation>({
    queryKey: ["balance-sheet-calculation", draftId],
    queryFn: () =>
      apiClient
        .get<BalanceSheetCalculation>(`/balance-sheet/drafts/${draftId}/calculate`)
        .then((r) => r.data),
    enabled: !!draftId,
  });
}

export function useUpdateDraft(draftId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation<BalanceSheetDraft, Error, BalanceSheetDraftUpdate>({
    mutationFn: (data) =>
      apiClient
        .put<BalanceSheetDraft>(`/balance-sheet/drafts/${draftId}`, data)
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance-sheet-drafts"] });
      if (draftId) {
        queryClient.invalidateQueries({
          queryKey: ["balance-sheet-calculation", draftId],
        });
      }
      console.log("Brouillon mis à jour");
    },
  });
}
