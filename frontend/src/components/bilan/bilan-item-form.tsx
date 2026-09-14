"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api";
import { handleApiError } from "@/lib/api";
import { CATEGORY_LABELS } from "@/lib/constants/balance-sheet";
import type { BalanceSheetCategory, BalanceSheetItem } from "@/types/balance-sheet";

export interface BilanItemFormProps {
  draftId: string;
  onAdd: (item: BalanceSheetItem) => void;
  isCompact?: boolean;
  defaultCategory?: BalanceSheetCategory;
  className?: string;
}

const DEFAULT_CATEGORIES: BalanceSheetCategory[] = [
  "actif",
  "passif",
  "capitaux_propres",
];

export function BilanItemForm({
  draftId,
  onAdd,
  isCompact = false,
  defaultCategory = "actif",
  className = "",
}: BilanItemFormProps) {
  const [formData, setFormData] = useState<Omit<BalanceSheetItem, "id" | "draft_id" | "is_calculated">>({
    category: defaultCategory,
    account_code: "",
    account_name: "",
    amount: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(!isCompact);
  const formRef = useRef<HTMLFormElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showForm && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [showForm]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.account_code.trim()) {
      newErrors.account_code = "Code requis";
    }
    if (!formData.account_name.trim()) {
      newErrors.account_name = "Nom requis";
    }
    if (formData.amount <= 0) {
      newErrors.amount = "Montant > 0";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback(
    (field: keyof typeof formData, value: string | number) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    },
    [errors]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const newItem = {
        ...formData,
        draft_id: draftId,
        is_calculated: false,
      };

      const response = await apiClient.post<BalanceSheetItem>(`/balance-sheet/drafts/${draftId}/items`, newItem);
      const savedItem = response.data;
      onAdd(savedItem);
      resetForm();
    } catch (err: unknown) {
      const error = handleApiError(err);
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category: defaultCategory,
      account_code: "",
      account_name: "",
      amount: 0,
    });
    setErrors({});
    if (isCompact) {
      setShowForm(false);
    }
  };

  const handleCancel = () => {
    resetForm();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  const toggleForm = () => {
    if (!showForm) {
      setShowForm(true);
    }
  };

  if (isCompact && !showForm) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={toggleForm}
        className={`w-full justify-start gap-2 ${className}`}
        aria-label="Ajouter un élément"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Ajouter une ligne
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className={`space-y-3 ${className}`}
      noValidate
    >
      {errors.submit && (
        <div className="rounded-md bg-red-50 p-2 text-xs text-red-600" role="alert">
          {errors.submit}
        </div>
      )}

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 sm:col-span-3">
          <Label htmlFor="category" className="block text-xs font-medium text-gray-700 mb-1">
            Catégorie
          </Label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => handleChange("category", e.target.value as BalanceSheetCategory)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1.5 text-sm"
            disabled={isSubmitting}
            required
          >
            {DEFAULT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-12 sm:col-span-3">
          <Label htmlFor="account_code" className="block text-xs font-medium text-gray-700 mb-1">
            Code compte
          </Label>
          <Input
            ref={firstInputRef}
            id="account_code"
            type="text"
            value={formData.account_code}
            onChange={(e) => handleChange("account_code", e.target.value)}
            placeholder="Ex: 101"
            maxLength={20}
            required
            disabled={isSubmitting}
            error={errors.account_code}
            className="text-sm"
          />
        </div>

        <div className="col-span-12 sm:col-span-4">
          <Label htmlFor="account_name" className="block text-xs font-medium text-gray-700 mb-1">
            Nom du compte
          </Label>
          <Input
            id="account_name"
            type="text"
            value={formData.account_name}
            onChange={(e) => handleChange("account_name", e.target.value)}
            placeholder="Ex: Capital social"
            maxLength={100}
            required
            disabled={isSubmitting}
            error={errors.account_name}
            className="text-sm"
          />
        </div>

        <div className="col-span-12 sm:col-span-2">
          <Label htmlFor="amount" className="block text-xs font-medium text-gray-700 mb-1">
            Montant (€)
          </Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={formData.amount}
            onChange={(e) => handleChange("amount", parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            required
            disabled={isSubmitting}
            error={errors.amount}
            className="text-sm text-right"
          />
        </div>

        <div className="col-span-12 sm:col-span-auto flex items-end gap-2">
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} className="whitespace-nowrap">
            {isCompact ? "Ajouter" : "Créer"}
          </Button>
          {!isCompact && (
            <Button type="button" variant="ghost" size="sm" onClick={handleCancel} disabled={isSubmitting}>
              Annuler
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

export default BilanItemForm;