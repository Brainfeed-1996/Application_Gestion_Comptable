"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useTransactions } from "@/hooks/use-transactions";
import type { Transaction } from "@/types/transaction";
import { exportToCSV } from "@/lib/utils/export";
import type { ExportRow } from "@/lib/utils/export";
import { TransactionForm, type TransactionFormData } from "@/components/transactions/transaction-form";
import { Button } from "@/components/ui/button";
import { Select as UISelect } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function TransactionsPage() {
  const { fetchAll, create, isLoading, error } = useTransactions();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterAccount, setFilterAccount] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const categoryOptions = useMemo(() => {
    const cats = new Set<string>();
    transactions.forEach((t) => {
      if (t.categoryName) cats.add(t.categoryName);
    });
    return Array.from(cats).sort();
  }, [transactions]);

  const handleSearch = useCallback(async () => {
    const result = await fetchAll({
      search: search || undefined,
      type: filterType || undefined,
      categoryId: filterCategory || undefined,
      accountId: filterAccount || undefined,
      page: 1,
      limit: 50,
    });
    if (result) {
      setTransactions(result.items);
    }
  }, [fetchAll, search, filterType, filterCategory, filterAccount]);

  const handleQuickAddSubmit = useCallback(
    async (data: TransactionFormData) => {
      const result = await create({
        date: data.date,
        label: data.label,
        amount: data.amount,
        direction: data.type,
        categoryId: data.category || "",
        accountId: data.account,
        counterparty: "",
        reference: data.reference || "",
        description: data.description || "",
        currency: "EUR",
      });
      if (result) {
        setShowQuickAdd(false);
        handleSearch();
      }
    },
    [create, handleSearch]
  );

  const handleExportCSV = useCallback(() => {
    const rows: ExportRow[] = transactions.map((t) => ({
      Date: t.date,
      Libellé: t.label,
      Montant: t.amount,
      Type: t.direction,
      Catégorie: t.categoryName || "",
      Compte: t.accountName || "",
      Référence: t.reference || "",
    }));
    exportToCSV(rows, `transactions_${new Date().toISOString().split("T")[0]}`);
  }, [transactions]);

  const formatAmount = (amount: number, direction: "debit" | "credit") => {
    const sign = direction === "debit" ? "-" : "+";
    return `${sign} ${amount.toLocaleString("fr-FR", {
      style: "currency",
      currency: "EUR",
    })}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="text-sm text-gray-500 mt-1">
              Gérez vos transactions comptables
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowQuickAdd((v) => !v)}
            >
              {showQuickAdd ? "Masquer l'ajout rapide" : "Ajout rapide"}
            </Button>
            <Link
              href="/transactions/new"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Ajouter une transaction
            </Link>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
            Erreur lors du chargement des transactions
          </div>
        )}

        {showQuickAdd && (
          <Card>
            <CardContent className="pt-6">
              <TransactionForm
                onSubmit={handleQuickAddSubmit}
                onCancel={() => setShowQuickAdd(false)}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        )}

        <div className="rounded-lg bg-white shadow border border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recherche
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par libellé..."
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="">Tous</option>
                <option value="debit">Débit</option>
                <option value="credit">Crédit</option>
              </select>
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </Label>
              <UISelect
                value={filterCategory}
                onValueChange={setFilterCategory}
                className="min-w-[160px]"
              >
                <option value="">Toutes</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </UISelect>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compte
              </label>
              <input
                type="text"
                value={filterAccount}
                onChange={(e) => setFilterAccount(e.target.value)}
                placeholder="ID compte"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="inline-flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
              >
                {isLoading ? "Chargement..." : "Filtrer"}
              </button>
              <Button
                variant="outline"
                onClick={handleExportCSV}
                disabled={transactions.length === 0}
              >
                📥 Export CSV
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white shadow border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Libellé
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compte
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Chargement...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Aucune transaction trouvée
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.label}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      {formatAmount(transaction.amount, transaction.direction)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.categoryName || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.accountName || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
