"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTransaction, useUpdateTransaction } from "@/hooks/use-transaction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { TransactionCreate } from "@/types/transaction";

interface FormErrors {
  label?: string;
  amount?: string;
  transactionDate?: string;
  valueDate?: string;
  accountId?: string;
  categoryId?: string;
  direction?: string;
  currency?: string;
}

const initialFormData: TransactionCreate = {
  accountId: "",
  label: "",
  amount: 0,
  direction: "debit",
  transactionDate: "",
  categoryId: "",
  counterparty: "",
  reference: "",
  description: "",
  currency: "EUR",
};

export default function EditTransactionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: transaction, isLoading, error } = useTransaction(id);
  const { update, isLoading: isSubmitting, error: updateError } = useUpdateTransaction(id);
  const [formData, setFormData] = useState<TransactionCreate | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (!transaction) return;

    setFormData({
      accountId: transaction.accountId,
      label: transaction.label,
      amount: transaction.amount,
      direction: transaction.direction,
      transactionDate: transaction.transactionDate,
      valueDate: transaction.valueDate || "",
      categoryId: transaction.categoryId || "",
      counterparty: transaction.counterparty || "",
      reference: transaction.reference || "",
      description: transaction.description || "",
      currency: transaction.currency || "EUR",
    });
  }, [transaction]);

  const clearError = (field: keyof FormErrors) => {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleChange = (
    field: keyof TransactionCreate,
    value: string | number,
  ) => {
    setFormData((current) => (current ? { ...current, [field]: value } : current));
    clearError(field as keyof FormErrors);
  };

  const validate = (): boolean => {
    if (!formData) return false;

    const nextErrors: FormErrors = {};
    const amount = Number(formData.amount);

    if (!formData.label.trim()) {
      nextErrors.label = "Le libellé est requis";
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      nextErrors.amount = "Le montant doit être supérieur à 0";
    }

    if (!formData.transactionDate) {
      nextErrors.transactionDate = "La date est requise";
    } else if (Number.isNaN(Date.parse(formData.transactionDate))) {
      nextErrors.transactionDate = "La date n'est pas valide";
    }

    if (
      formData.valueDate &&
      formData.transactionDate &&
      formData.valueDate < formData.transactionDate
    ) {
      nextErrors.valueDate = "La date de valeur ne peut pas précéder la date de transaction";
    }

    if (!formData.accountId.trim()) {
      nextErrors.accountId = "Le compte est requis";
    }

    if (formData.categoryId && !formData.categoryId.trim()) {
      nextErrors.categoryId = "La catégorie n'est pas valide";
    }

    if (formData.direction !== "debit" && formData.direction !== "credit") {
      nextErrors.direction = "Le type est requis";
    }

    if (formData.currency && !/^[A-Za-z]{3}$/.test(formData.currency)) {
      nextErrors.currency = "La devise doit contenir 3 lettres";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGeneralError(null);

    if (!formData || !validate()) return;

    const result = await update(formData);
    if (result) {
      router.push(`/transactions/${id}`);
      return;
    }

    setGeneralError(updateError?.message || "Erreur lors de la mise à jour de la transaction");
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="flex items-center gap-3 text-gray-600">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          Chargement...
        </div>
      </main>
    );
  }

  if (error || !transaction || !formData) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-lg border border-red-200 bg-white p-6 text-center">
          <h1 className="text-xl font-semibold text-red-700">Transaction indisponible</h1>
          <p className="mt-2 text-sm text-gray-600">
            {error?.message || "La transaction demandée est introuvable."}
          </p>
          <Button onClick={() => router.push("/transactions")} className="mt-5">
            Retour aux transactions
          </Button>
        </div>
      </main>
    );
  }

  const errorMessage = updateError?.message || generalError;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Modifier la transaction</h1>
            <p className="mt-1 text-sm text-gray-500">Transaction {transaction.id}</p>
          </div>
          <Button variant="ghost" onClick={() => router.push(`/transactions/${id}`)}>
            Annuler
          </Button>
        </div>

        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Informations de la transaction</h2>

            <div className="mt-6 space-y-6">
              <div>
                <label htmlFor="label" className="block text-sm font-medium text-gray-700">
                  Libellé <span className="text-red-500">*</span>
                </label>
                <Input
                  id="label"
                  type="text"
                  value={formData.label}
                  onChange={(event) => handleChange("label", event.target.value)}
                  required
                  placeholder="Ex: Facture fournisseur"
                  aria-invalid={!!errors.label}
                  aria-describedby={errors.label ? "label-error" : undefined}
                  className={`mt-1 ${errors.label ? "border-red-300" : ""}`}
                />
                {errors.label && <p id="label-error" className="mt-1 text-sm text-red-600">{errors.label}</p>}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Montant <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.amount || ""}
                    onChange={(event) => handleChange("amount", event.target.value === "" ? 0 : Number(event.target.value))}
                    required
                    placeholder="0.00"
                    aria-invalid={!!errors.amount}
                    aria-describedby={errors.amount ? "amount-error" : undefined}
                    className={`mt-1 ${errors.amount ? "border-red-300" : ""}`}
                  />
                  {errors.amount && <p id="amount-error" className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                </div>

                <div>
                  <label htmlFor="direction" className="block text-sm font-medium text-gray-700">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <Select
                    id="direction"
                    value={formData.direction}
                    onChange={(event) => handleChange("direction", event.target.value)}
                    required
                    aria-invalid={!!errors.direction}
                    aria-describedby={errors.direction ? "direction-error" : undefined}
                    className={`mt-1 ${errors.direction ? "border-red-300" : ""}`}
                  >
                    <option value="debit">Dépense (débit)</option>
                    <option value="credit">Recette (crédit)</option>
                  </Select>
                  {errors.direction && <p id="direction-error" className="mt-1 text-sm text-red-600">{errors.direction}</p>}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="transactionDate" className="block text-sm font-medium text-gray-700">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="transactionDate"
                    type="date"
                    value={formData.transactionDate}
                    onChange={(event) => handleChange("transactionDate", event.target.value)}
                    required
                    aria-invalid={!!errors.transactionDate}
                    aria-describedby={errors.transactionDate ? "transaction-date-error" : undefined}
                    className={`mt-1 ${errors.transactionDate ? "border-red-300" : ""}`}
                  />
                  {errors.transactionDate && <p id="transaction-date-error" className="mt-1 text-sm text-red-600">{errors.transactionDate}</p>}
                </div>

                <div>
                  <label htmlFor="valueDate" className="block text-sm font-medium text-gray-700">
                    Date de valeur
                  </label>
                  <Input
                    id="valueDate"
                    type="date"
                    value={formData.valueDate || ""}
                    onChange={(event) => handleChange("valueDate", event.target.value)}
                    aria-invalid={!!errors.valueDate}
                    aria-describedby={errors.valueDate ? "value-date-error" : undefined}
                    className={`mt-1 ${errors.valueDate ? "border-red-300" : ""}`}
                  />
                  {errors.valueDate && <p id="value-date-error" className="mt-1 text-sm text-red-600">{errors.valueDate}</p>}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="accountId" className="block text-sm font-medium text-gray-700">
                    Compte <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="accountId"
                    type="text"
                    value={formData.accountId}
                    onChange={(event) => handleChange("accountId", event.target.value)}
                    required
                    placeholder="ID du compte"
                    aria-invalid={!!errors.accountId}
                    aria-describedby={errors.accountId ? "account-id-error" : undefined}
                    className={`mt-1 ${errors.accountId ? "border-red-300" : ""}`}
                  />
                  {errors.accountId && <p id="account-id-error" className="mt-1 text-sm text-red-600">{errors.accountId}</p>}
                </div>

                <div>
                  <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                    Catégorie
                  </label>
                  <Input
                    id="categoryId"
                    type="text"
                    value={formData.categoryId || ""}
                    onChange={(event) => handleChange("categoryId", event.target.value)}
                    placeholder="ID de catégorie"
                    aria-invalid={!!errors.categoryId}
                    aria-describedby={errors.categoryId ? "category-id-error" : undefined}
                    className={`mt-1 ${errors.categoryId ? "border-red-300" : ""}`}
                  />
                  {errors.categoryId && <p id="category-id-error" className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                    Devise
                  </label>
                  <Select
                    id="currency"
                    value={formData.currency || "EUR"}
                    onChange={(event) => handleChange("currency", event.target.value)}
                    aria-invalid={!!errors.currency}
                    aria-describedby={errors.currency ? "currency-error" : undefined}
                    className={`mt-1 ${errors.currency ? "border-red-300" : ""}`}
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                  </Select>
                  {errors.currency && <p id="currency-error" className="mt-1 text-sm text-red-600">{errors.currency}</p>}
                </div>

                <div>
                  <label htmlFor="counterparty" className="block text-sm font-medium text-gray-700">
                    Contrepartie
                  </label>
                  <Input
                    id="counterparty"
                    type="text"
                    value={formData.counterparty || ""}
                    onChange={(event) => handleChange("counterparty", event.target.value)}
                    placeholder="Nom du tiers"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(event) => handleChange("description", event.target.value)}
                  rows={5}
                  placeholder="Description détaillée"
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div>
                <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
                  Référence
                </label>
                <Input
                  id="reference"
                  type="text"
                  value={formData.reference || ""}
                  onChange={(event) => handleChange("reference", event.target.value)}
                  placeholder="Référence"
                  className="mt-1"
                />
              </div>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => router.push(`/transactions/${id}`)}>
              Annuler
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
