"use client";

import { useState, useEffect } from "react";
import { useBalanceSheetDrafts, useUpdateDraft, type BalanceSheetDraft } from "@/hooks/use-balance-sheet";
import { useAuth } from "@/hooks/use-auth";

export interface BilanFormData {
  category: "actif" | "passif" | "capitaux_propres";
  account_code: string;
  account_name: string;
  amount: number;
}

export interface BilanFormProps {
  draftId?: string;
  onSave?: (data: BilanFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<BilanFormData>;
}

export function BilanForm({
  draftId,
  onSave,
  onCancel,
  initialData = {},
}: BilanFormProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: drafts, isLoading: draftsLoading, error: draftsError } = useBalanceSheetDrafts();
  const updateDraft = useUpdateDraft(draftId);

  const [formData, setFormData] = useState<BilanFormData>({
    category: "actif",
    account_code: "",
    account_name: "",
    amount: 0,
    ...initialData,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDraft, setSelectedDraft] = useState<BalanceSheetDraft | null>(null);

  useEffect(() => {
    if (draftId && drafts) {
      const draft = drafts.find((d) => d.id === draftId);
      setSelectedDraft(draft || null);
    }
  }, [draftId, drafts]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.account_code.trim()) {
      setError("Le code de compte est requis");
      return;
    }
    if (!formData.account_name.trim()) {
      setError("Le nom du compte est requis");
      return;
    }
    if (formData.amount <= 0) {
      setError("Le montant doit être supérieur à 0");
      return;
    }

    setIsSubmitting(true);

    try {
      if (onSave) {
        onSave(formData);
      } else if (draftId && updateDraft) {
        await updateDraft.mutateAsync({
          ...formData,
          name: formData.account_name,
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors de la sauvegarde";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    setFormData({
      category: "actif",
      account_code: "",
      account_name: "",
      amount: 0,
      ...initialData,
    });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200">
        <p className="text-yellow-800">Veuillez vous connecter pour accéder au formulaire de bilan.</p>
      </div>
    );
  }

  const categories = [
    { value: "actif", label: "Actif" },
    { value: "passif", label: "Passif" },
    { value: "capitaux_propres", label: "Capitaux propres" },
  ] as const;

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {draftId ? "Modifier l'élément de bilan" : "Nouvel élément de bilan"}
        </h2>
        {selectedDraft && (
          <p className="mt-1 text-sm text-gray-500">
            Brouillon : {selectedDraft.name} ({selectedDraft.status})
          </p>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600" role="alert">
          {error}
        </div>
      )}

      {(draftsLoading || updateDraft.isPending) && (
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
          Chargement...
        </div>
      )}

      {draftsError && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600" role="alert">
          Erreur lors du chargement des brouillons : {draftsError.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Catégorie <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="account_code" className="block text-sm font-medium text-gray-700">
            Code de compte <span className="text-red-500">*</span>
          </label>
          <input
            id="account_code"
            name="account_code"
            type="text"
            value={formData.account_code}
            onChange={handleChange}
            required
            placeholder="Ex: 101, 201, 401, 512..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            maxLength={20}
          />
          <p className="mt-1 text-xs text-gray-500">
            Code selon le Plan Comptable Général (ex: 101 pour Capital, 21 pour Immobilisations, 401 pour Fournisseurs...)
          </p>
        </div>

        <div>
          <label htmlFor="account_name" className="block text-sm font-medium text-gray-700">
            Nom du compte <span className="text-red-500">*</span>
          </label>
          <input
            id="account_name"
            name="account_name"
            type="text"
            value={formData.account_name}
            onChange={handleChange}
            required
            placeholder="Ex: Capital social, Matériel de transport, Fournisseurs..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            maxLength={100}
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Montant (€) <span className="text-red-500">*</span>
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={formData.amount}
            onChange={handleChange}
            required
            placeholder="0.00"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || updateDraft.isPending}
            className="flex-1 rounded-md bg-blue-600 py-2 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting || updateDraft.isPending ? "Enregistrement..." : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting || updateDraft.isPending}
            className="flex-1 rounded-md bg-gray-200 py-2 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 disabled:opacity-50"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

export default BilanForm;