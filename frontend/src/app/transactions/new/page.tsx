"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTransactions } from "@/hooks/use-transactions";
import { apiClient } from "@/lib/api";
import type { TransactionCreate } from "@/types/transaction";

interface FormErrors {
  label?: string;
  amount?: string;
  transactionDate?: string;
  accountId?: string;
  direction?: string;
}

export default function NewTransactionPage() {
  const router = useRouter();
  const { create } = useTransactions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [formData, setFormData] = useState<TransactionCreate>({
    accountId: "",
    label: "",
    amount: 0,
    direction: "debit",
    transactionDate: new Date().toISOString().split("T")[0],
    categoryId: "",
    counterparty: "",
    reference: "",
    description: "",
    currency: "EUR",
  });

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.label.trim()) {
      newErrors.label = "Le libellé est requis";
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Le montant doit être supérieur à 0";
    }

    if (!formData.transactionDate) {
      newErrors.transactionDate = "La date est requise";
    }

    if (!formData.accountId) {
      newErrors.accountId = "Le compte est requis";
    }

    if (!formData.direction) {
      newErrors.direction = "Le type (débit/crédit) est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    field: keyof TransactionCreate,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = await create(formData);
      if (result) {
        router.push("/transactions");
      } else {
        setGeneralError("Erreur lors de la création de la transaction");
      }
    } catch (err: any) {
      setGeneralError(
        err?.response?.data?.detail || "Erreur lors de la création",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Nouvelle transaction
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Créer une nouvelle transaction
            </p>
          </div>
        </div>

        {generalError && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-600">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg bg-white shadow border border-gray-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Informations de la transaction
            </h2>

            <div>
              <label
                htmlFor="label"
                className="block text-sm font-medium text-gray-700"
              >
                Libellé <span className="text-red-500">*</span>
              </label>
              <input
                id="label"
                type="text"
                value={formData.label}
                onChange={(e) => handleChange("label", e.target.value)}
                required
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm ${
                  errors.label ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Ex: Facture fournisseur"
              />
              {errors.label && (
                <p className="mt-1 text-sm text-red-600">{errors.label}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Montant <span className="text-red-500">*</span>
                </label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount || ""}
                  onChange={(e) =>
                    handleChange("amount", parseFloat(e.target.value))
                  }
                  required
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm ${
                    errors.amount ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="0.00"
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="direction"
                  className="block text-sm font-medium text-gray-700"
                >
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="direction"
                  value={formData.direction}
                  onChange={(e) => handleChange("direction", e.target.value)}
                  required
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm ${
                    errors.direction ? "border-red-300" : ""
                  }`}
                >
                  <option value="debit">Débit</option>
                  <option value="credit">Crédit</option>
                </select>
                {errors.direction && (
                  <p className="mt-1 text-sm text-red-600">{errors.direction}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="transactionDate"
                  className="block text-sm font-medium text-gray-700"
                >
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="transactionDate"
                  type="date"
                  value={formData.transactionDate}
                  onChange={(e) => handleChange("transactionDate", e.target.value)}
                  required
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm ${
                    errors.transactionDate ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {errors.transactionDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.transactionDate}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="accountId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Compte <span className="text-red-500">*</span>
                </label>
                <input
                  id="accountId"
                  type="text"
                  value={formData.accountId}
                  onChange={(e) => handleChange("accountId", e.target.value)}
                  required
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm ${
                    errors.accountId ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="ID du compte"
                />
                {errors.accountId && (
                  <p className="mt-1 text-sm text-red-600">{errors.accountId}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="categoryId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Catégorie
                </label>
                <input
                  id="categoryId"
                  type="text"
                  value={formData.categoryId || ""}
                  onChange={(e) => handleChange("categoryId", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  placeholder="ID catégorie (optionnel)"
                />
              </div>

              <div>
                <label
                  htmlFor="currency"
                  className="block text-sm font-medium text-gray-700"
                >
                  Devise
                </label>
                <select
                  id="currency"
                  value={formData.currency || "EUR"}
                  onChange={(e) => handleChange("currency", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="counterparty"
                className="block text-sm font-medium text-gray-700"
              >
                Contrepartie
              </label>
              <input
                id="counterparty"
                type="text"
                value={formData.counterparty || ""}
                onChange={(e) => handleChange("counterparty", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                placeholder="Nom du tiers"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                placeholder="Description détaillée (optionnel)"
              />
            </div>

            <div>
              <label
                htmlFor="reference"
                className="block text-sm font-medium text-gray-700"
              >
                Référence
              </label>
              <input
                id="reference"
                type="text"
                value={formData.reference || ""}
                onChange={(e) => handleChange("reference", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                placeholder="Référence (optionnel)"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/transactions")}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isSubmitting ? "Création..." : "Créer la transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
