"use client";

import { useCallback, useState } from "react";
import { apiClient } from "@/lib/api";
import type { BalanceSheetTemplate } from "@/hooks/use-balance-sheet";
import type { BalanceSheetSection, BalanceSheetCategory } from "@/lib/constants/balance-sheet";

export interface BilanTemplate extends BalanceSheetTemplate {
  businessType?: string;
  isDefault?: boolean;
  description?: string;
}

export interface CreateTemplateInput {
  name: string;
  businessType: string;
  description?: string;
  sections: BalanceSheetSection[];
}

export interface UpdateTemplateInput extends Partial<CreateTemplateInput> {
  id: string;
}

const BUSINESS_TYPES = [
  { id: "service", label: "Prestation de services" },
  { id: "commerce", label: "Commerce de détail" },
  { id: "production", label: "Production de biens" },
] as const;

const CATEGORIES: BalanceSheetCategory[] = ["actif", "passif", "capitaux_propres"];

const CATEGORY_LABELS: Record<BalanceSheetCategory, string> = {
  actif: "Actif",
  passif: "Passif",
  capitaux_propres: "Capitaux propres",
};

export function useBilanTemplates() {
  const [templates, setTemplates] = useState<BilanTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async (): Promise<BilanTemplate[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<BilanTemplate[]>("/bilan/templates");
      setTemplates(response.data);
      return response.data;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      setError(err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getById = useCallback(async (id: string): Promise<BilanTemplate | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<BilanTemplate>(`/bilan/templates/${id}`);
      return response.data;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      setError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const create = useCallback(async (data: CreateTemplateInput): Promise<BilanTemplate | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<BilanTemplate>("/bilan/templates", data);
      setTemplates((prev) => [...prev, response.data]);
      return response.data;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      setError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const update = useCallback(async (data: UpdateTemplateInput): Promise<BilanTemplate | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const { id, ...updateData } = data;
      const response = await apiClient.put<BilanTemplate>(`/bilan/templates/${id}`, updateData);
      setTemplates((prev) => prev.map((t) => (t.id === id ? response.data : t)));
      return response.data;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      setError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/bilan/templates/${id}`);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setDefault = useCallback(async (id: string): Promise<BilanTemplate | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.put<BilanTemplate>(`/bilan/templates/${id}/default`);
      setTemplates((prev) => prev.map((t) => (t.id === id ? response.data : t)));
      return response.data;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      setError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getBusinessTypes = useCallback(() => BUSINESS_TYPES, []);
  const getCategories = useCallback(() => CATEGORIES, []);
  const getCategoryLabel = useCallback((cat: BalanceSheetCategory) => CATEGORY_LABELS[cat], []);

  return {
    templates,
    isLoading,
    error,
    fetchAll,
    getById,
    create,
    update,
    remove,
    setDefault,
    getBusinessTypes,
    getCategories,
    getCategoryLabel,
  };
}

export function useBilanTemplate(id: string | undefined) {
  const [data, setData] = useState<BilanTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTemplate = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<BilanTemplate>(`/bilan/templates/${id}`);
      setData(response.data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  return { data, isLoading, error, refetch: fetchTemplate };
}