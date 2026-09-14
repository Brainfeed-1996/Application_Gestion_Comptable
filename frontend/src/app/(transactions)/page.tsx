'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TransactionsTable } from '@/components/transactions/TransactionsTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useTransactions } from '@/hooks/use-transactions';

const TYPE_OPTIONS = [
  { value: '', label: 'Tous' },
  { value: 'debit', label: 'Dépenses' },
  { value: 'credit', label: 'Recettes' },
];

export default function TransactionsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { transactions, isLoading: isLoadingData, pagination, filters, setFilters, remove, reconcile } = useTransactions();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return <div>Chargement...</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Transactions</h2>
            <p className="text-muted-foreground">Gérez vos transactions comptables</p>
          </div>
          <Button>Nouvelle transaction</Button>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Rechercher..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="max-w-sm"
            aria-label="Rechercher une transaction"
          />
          <Select value={filters.type || ''} onValueChange={(v) => setFilters({ ...filters, type: v || undefined })} aria-label="Filtrer par type">
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        </div>

        <TransactionsTable
          transactions={transactions}
          isLoading={isLoadingData}
          onEdit={() => {}}
          onDelete={(id) => remove.mutate(id)}
          onReconcile={(id) => reconcile.mutate(id)}
        />

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {pagination.total} transactions
          </p>
          <div className="flex gap-1">
            <Button variant="outline" disabled={pagination.page <= 1}>Précédent</Button>
            <Button variant="outline" disabled={pagination.page >= pagination.totalPages}>Suivant</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
