"use client";

import { useState, useCallback, useEffect } from "react";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAccounts } from "@/hooks/use-accounts";
import type { TransactionType } from "@/types/transaction";
import { cn } from "@/lib/utils";

const transactionSchema = z.object({
  date: z.string().min(1, "La date est requise"),
  label: z.string().min(1, "Le libellé est requis"),
  amount: z.number().positive("Le montant doit être positif"),
  type: z.enum(["debit", "credit"]),
  category: z.string().optional(),
  account: z.string().min(1, "Le compte est requis"),
  description: z.string().optional(),
  reference: z.string().optional(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  initialData?: Partial<TransactionFormData>;
  onSubmit: (data: TransactionFormData) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

const DEFAULT_VALUES: TransactionFormData = {
  date: new Date().toISOString().split("T")[0],
  label: "",
  amount: 0,
  type: "debit",
  category: "",
  account: "",
  description: "",
  reference: "",
};

export function TransactionForm({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
}: TransactionFormProps) {
  const { data: accounts } = useAccounts();
  const [formData, setFormData] = useState<TransactionFormData>(() => ({
    ...DEFAULT_VALUES,
    ...initialData,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...DEFAULT_VALUES, ...initialData }));
    }
  }, [initialData]);

  const validateField = useCallback(
    (name: keyof TransactionFormData, value: unknown): string | undefined => {
      try {
        const fieldSchema = transactionSchema.pick({ [name]: true } as Record<keyof TransactionFormData, true>);
        const result = fieldSchema.safeParse({ [name]: value });
        if (!result.success) {
          return result.error.errors[0]?.message;
        }
      } catch {
        const fullResult = transactionSchema.safeParse(formData);
        if (!fullResult.success) {
          const err = fullResult.error.errors.find((e) => e.path[0] === name);
          if (err) return err.message;
        }
      }
      return undefined;
    },
    [formData]
  );

  const handleChange = useCallback(
    (field: keyof TransactionFormData, value: string | number) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setTouched((prev) => ({ ...prev, [field]: true }));
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [validateField]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const result = transactionSchema.safeParse(formData);
      if (!result.success) {
        const newErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          const path = err.path[0] as string;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
        setTouched({
          date: true, label: true, amount: true, type: true,
          category: true, account: true, description: true, reference: true,
        });
        return;
      }
      setErrors({});
      onSubmit(result.data);
    },
    [formData, onSubmit]
  );

  const renderError = (field: string) => {
    if (!touched[field] && !errors[field]) return null;
    if (!errors[field]) return null;
    return <p className="text-xs text-destructive mt-1">{errors[field]}</p>;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Nouvelle transaction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, date: true }))}
                className={cn(errors.date && "border-red-500")}
                aria-invalid={!!errors.date}
                disabled={isLoading}
              />
              {renderError("date")}
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                id="type"
                value={formData.type}
                onValueChange={(v) => handleChange("type", v as TransactionType)}
                aria-invalid={!!errors.type}
                disabled={isLoading}
              >
                <option value="debit">Dépense (Débit)</option>
                <option value="credit">Recette (Crédit)</option>
              </Select>
              {renderError("type")}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="label">Libellé</Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => handleChange("label", e.target.value)}
              onBlur={() => setTouched((p) => ({ ...p, label: true }))}
              placeholder="Description de la transaction"
              aria-invalid={!!errors.label}
              disabled={isLoading}
              className={cn(errors.label && "border-red-500")}
            />
            {renderError("label")}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Montant</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount || ""}
                onChange={(e) => handleChange("amount", parseFloat(e.target.value) || 0)}
                onBlur={() => setTouched((p) => ({ ...p, amount: true }))}
                aria-invalid={!!errors.amount}
                disabled={isLoading}
                className={cn(errors.amount && "border-red-500")}
              />
              {renderError("amount")}
            </div>
            <div className="space-y-2">
              <Label htmlFor="account">Compte</Label>
              <Select
                id="account"
                value={formData.account}
                onValueChange={(v) => handleChange("account", v)}
                aria-invalid={!!errors.account}
                disabled={isLoading}
              >
                <option value="">Sélectionner</option>
                {accounts?.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
              {renderError("account")}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Input
                id="category"
                value={formData.category || ""}
                onChange={(e) => handleChange("category", e.target.value)}
                placeholder="ID catégorie (optionnel)"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">Référence</Label>
              <Input
                id="reference"
                value={formData.reference || ""}
                onChange={(e) => handleChange("reference", e.target.value)}
                placeholder="Référence (optionnel)"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              placeholder="Description détaillée (optionnel)"
              disabled={isLoading}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Chargement...
            </>
          ) : (
            "Créer"
          )}
        </Button>
      </div>
    </form>
  );
}
