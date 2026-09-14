"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { apiClient } from "@/lib/api";
import { handleApiError } from "@/lib/api";
import { CATEGORY_LABELS } from "@/lib/constants/balance-sheet";
import type { BalanceSheetCategory, BalanceSheetItem } from "@/types/balance-sheet";

export interface BilanItemEditorProps {
  item: BalanceSheetItem | null;
  open: boolean;
  onClose: () => void;
  onSave: (item: BalanceSheetItem) => void;
  draftId: string;
  isLoading?: boolean;
}

const DEFAULT_CATEGORIES: BalanceSheetCategory[] = [
  "actif",
  "passif",
  "capitaux_propres",
];

export function BilanItemEditor({
  item,
  open,
  onClose,
  onSave,
  draftId,
  isLoading = false,
}: BilanItemEditorProps) {
  const [formData, setFormData] = useState<BalanceSheetItem | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && item) {
      setFormData({ ...item });
      setErrors({});
    } else if (!item) {
      setFormData({
        id: "",
        draft_id: draftId,
        category: "actif",
        account_code: "",
        account_name: "",
        amount: 0,
        is_calculated: false,
      });
    }
  }, [open, item, draftId]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData?.account_code.trim()) {
      newErrors.account_code = "Le code de compte est requis";
    }
    if (!formData?.account_name.trim()) {
      newErrors.account_name = "Le nom du compte est requis";
    }
    if (formData && formData.amount <= 0) {
      newErrors.amount = "Le montant doit être supérieur à 0";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback(
    (field: keyof BalanceSheetItem, value: string | number | boolean) => {
      setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    },
    [errors]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !validateForm()) return;

    setIsSubmitting(true);
    try {
      const itemToSave: BalanceSheetItem = {
        ...formData,
        draft_id: draftId,
      };

      if (formData.id) {
        await apiClient.put(`/balance-sheet/drafts/${draftId}/items/${formData.id}`, itemToSave);
      } else {
        const response = await apiClient.post(`/balance-sheet/drafts/${draftId}/items`, itemToSave);
        itemToSave.id = response.data.id;
      }

      onSave(itemToSave);
      onClose();
    } catch (err: unknown) {
      const error = handleApiError(err);
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setErrors({});
    onClose();
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      title={item ? "Modifier l'élément de bilan" : "Nouvel élément de bilan"}
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {errors.submit && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600" role="alert">
            {errors.submit}
          </div>
        )}

        <div>
          <Label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Catégorie <span className="text-red-500">*</span>
          </Label>
          <select
            id="category"
            value={formData?.category || "actif"}
            onChange={(e) => handleChange("category", e.target.value as BalanceSheetCategory)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 text-sm"
            required
            disabled={isSubmitting || isLoading}
          >
            {DEFAULT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
        </div>

        <div>
          <Label htmlFor="account_code" className="block text-sm font-medium text-gray-700">
            Code de compte <span className="text-red-500">*</span>
          </Label>
          <Input
            id="account_code"
            type="text"
            value={formData?.account_code || ""}
            onChange={(e) => handleChange("account_code", e.target.value)}
            placeholder="Ex: 101, 201, 401, 512..."
            maxLength={20}
            required
            disabled={isSubmitting || isLoading}
            error={errors.account_code}
          />
          <p className="mt-1 text-xs text-gray-500">
            Code selon le Plan Comptable Général
          </p>
        </div>

        <div>
          <Label htmlFor="account_name" className="block text-sm font-medium text-gray-700">
            Nom du compte <span className="text-red-500">*</span>
          </Label>
          <Input
            id="account_name"
            type="text"
            value={formData?.account_name || ""}
            onChange={(e) => handleChange("account_name", e.target.value)}
            placeholder="Ex: Capital social, Matériel de transport, Fournisseurs..."
            maxLength={100}
            required
            disabled={isSubmitting || isLoading}
            error={errors.account_name}
          />
        </div>

        <div>
          <Label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Montant (€) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={formData?.amount || 0}
            onChange={(e) => handleChange("amount", parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            required
            disabled={isSubmitting || isLoading}
            error={errors.amount}
            className="text-right"
          />
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="is_calculated"
            checked={formData?.is_calculated || false}
            onChange={(checked) => handleChange("is_calculated", checked)}
            disabled={isSubmitting || isLoading}
          />
          <Label htmlFor="is_calculated" className="text-sm text-gray-700 cursor-pointer">
            Élément calculé automatiquement
          </Label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting || isLoading}
            className="flex-1"
          >
            {item ? "Enregistrer" : "Créer"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={isSubmitting || isLoading}
            className="flex-1"
          >
            Annuler
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

export default BilanItemEditor;