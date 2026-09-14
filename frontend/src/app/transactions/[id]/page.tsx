"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTransaction, useDeleteTransaction } from "@/hooks/use-transaction";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatFrenchCurrency, formatFrenchDate } from "@/lib/formatters";
import type { TransactionStatus } from "@/types/transaction";

const statusLabels: Record<TransactionStatus, { label: string; variant: "default" | "success" | "warning" | "error" | "info" }> = {
  pending: { label: "En attente", variant: "warning" },
  posted: { label: "Comptabilisée", variant: "success" },
  reconciled: { label: "Rapprochée", variant: "info" },
  void: { label: "Annulée", variant: "error" },
};

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: transaction, isLoading, error, refetch } = useTransaction(id);
  const { remove, isLoading: isDeleting, error: deleteError } = useDeleteTransaction(id);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    const deleted = await remove();
    if (deleted !== null) {
      router.push("/transactions");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <Spinner />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-lg border border-red-200 bg-white p-6 text-center">
          <h1 className="text-xl font-semibold text-red-700">Transaction indisponible</h1>
          <p className="mt-2 text-sm text-gray-600">
            {error?.message || "La transaction demandée est introuvable."}
          </p>
          <Button onClick={() => router.push("/transactions")} className="mt-5">
            Retour aux transactions
          </Button>
        </div>
      </div>
    );
  }

  const typeLabel = transaction.direction === "credit" ? "Recette" : "Dépense";
  const status = statusLabels[transaction.status] || {
    label: transaction.status,
    variant: "default" as const,
  };
  const amountLabel = `${transaction.direction === "credit" ? "+" : "-"} ${formatFrenchCurrency(transaction.amount)}`;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => router.back()} aria-label="Retour">
              ← Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Détails de la transaction</h1>
              <p className="mt-1 text-sm text-gray-500">Référence : {transaction.id}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/transactions/${transaction.id}/edit`}
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Modifier
            </Link>
            <Button
              variant="danger"
              isLoading={isDeleting}
              onClick={() => setShowDeleteConfirm(true)}
            >
              Supprimer
            </Button>
          </div>
        </div>

        {deleteError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
            {deleteError.message}
          </div>
        )}

        <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-200 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Libellé</p>
              <h2 className="mt-1 text-2xl font-semibold text-gray-900">{transaction.label}</h2>
            </div>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Date</p>
              <p className="mt-1 text-base text-gray-900">
                <time dateTime={transaction.transactionDate}>
                  {formatFrenchDate(transaction.transactionDate)}
                </time>
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Type</p>
              <div className="mt-1">
                <Badge variant={transaction.direction === "credit" ? "success" : "error"}>
                  {typeLabel}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Montant</p>
              <p className={`mt-1 text-2xl font-bold ${transaction.direction === "credit" ? "text-green-700" : "text-red-700"}`}>
                {amountLabel}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Compte</p>
              <p className="mt-1 text-base text-gray-900">{transaction.accountName || transaction.accountId || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Catégorie</p>
              <p className="mt-1 text-base text-gray-900">{transaction.categoryName || transaction.categoryId || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Devise</p>
              <p className="mt-1 text-base text-gray-900">{transaction.currency || "-"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-gray-500">Description</p>
              <p className="mt-1 whitespace-pre-wrap text-base text-gray-900">
                {transaction.description || "-"}
              </p>
            </div>
          </div>
        </section>

        {showDeleteConfirm && (
          <section className="rounded-lg border border-red-200 bg-red-50 p-6" role="alert" aria-labelledby="delete-confirmation-title">
            <h2 id="delete-confirmation-title" className="text-lg font-semibold text-red-800">
              Confirmer la suppression
            </h2>
            <p className="mt-2 text-sm text-red-700">
              Voulez-vous vraiment supprimer la transaction « {transaction.label} » ? Cette action est irréversible.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
                Annuler
              </Button>
              <Button variant="danger" isLoading={isDeleting} onClick={handleDelete}>
                Oui, supprimer
              </Button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
