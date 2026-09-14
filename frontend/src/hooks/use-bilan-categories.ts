"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { BilanCategory } from "@/types/balance-sheet";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BilanCategoryAccount {
  id: string;
  account_code: string;
  account_name: string;
  amount: number;
  is_calculated: boolean;
}

export interface BilanCategoryGroup {
  category: BilanCategory;
  label: string;
  accounts: BilanCategoryAccount[];
  total: number;
}

export interface BilanCategoriesData {
  draftId: string;
  groups: BilanCategoryGroup[];
}

export interface UpdateCategoryItemsInput {
  draftId: string;
  category: BilanCategory;
  items: BilanCategoryAccount[];
}

export interface AddAccountToCategoryInput {
  draftId: string;
  category: BilanCategory;
  accountId: string;
  account_code?: string;
  account_name?: string;
  amount?: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CATEGORY_LABELS: Record<BilanCategory, string> = {
  actif: "Actif",
  passif: "Passif",
  capitaux_propres: "Capitaux propres",
};

function computeGroup(
  category: BilanCategory,
  accounts: BilanCategoryAccount[]
): BilanCategoryGroup {
  const total = accounts.reduce((sum, acc) => sum + Number(acc.amount) || 0, 0);
  return {
    category,
    label: CATEGORY_LABELS[category],
    accounts,
    total,
  };
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Fetch the categories of a balance-sheet draft, grouped by bilan category.
 */
export function useBilanCategories(draftId: string | undefined) {
  return useQuery<BilanCategoriesData>({
    queryKey: ["bilan-categories", draftId],
    queryFn: () =>
      apiClient
        .get<BilanCategoriesData>(`/balance-sheet/drafts/${draftId}/categories`)
        .then((r) => r.data),
    enabled: !!draftId,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * Replace the accounts list of a given category within a draft.
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation<BilanCategoriesData, Error, UpdateCategoryItemsInput>({
    mutationFn: ({ draftId, category, items }) =>
      apiClient
        .put<BilanCategoriesData>(
          `/balance-sheet/drafts/${draftId}/categories/${category}`,
          { items },
        )
        .then((r) => r.data),
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["bilan-categories", data.draftId],
        data,
      );
      queryClient.invalidateQueries({
        queryKey: ["balance-sheet-calculation", data.draftId],
      });
    },
  });
}

/**
 * Add a single account to a category within a draft.
 */
export function useAddAccountToCategory() {
  const queryClient = useQueryClient();

  return useMutation<BilanCategoriesData, Error, AddAccountToCategoryInput>({
    mutationFn: ({ draftId, category, accountId, account_code, account_name, amount }) =>
      apiClient
        .post<BilanCategoriesData>(
          `/balance-sheet/drafts/${draftId}/categories/${category}/accounts`,
          {
            account_id: accountId,
            account_code,
            account_name,
            amount,
          },
        )
        .then((r) => r.data),
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["bilan-categories", data.draftId],
        data,
      );
    },
  });
}

// Re-export the category type for convenience.
export type { BilanCategory };

// Re-export the helper so consumers can build groups locally when needed.
export { computeGroup };