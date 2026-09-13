'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatFrenchCurrency, formatFrenchDate } from '@/lib/formatters';
import type { Transaction, TransactionType } from '@/types/transaction';

interface TransactionsTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onEdit?: (t: Transaction) => void;
  onDelete?: (id: string) => void;
  onReconcile?: (id: string) => void;
}

const TYPE_LABELS: Record<TransactionType, string> = {
  debit: 'Dépense',
  credit: 'Recette',
};

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info' }> = {
  pending: { label: 'En attente', variant: 'warning' },
  validated: { label: 'Validé', variant: 'success' },
  reconciled: { label: 'Réconcilié', variant: 'default' },
  cancelled: { label: 'Annulé', variant: 'destructive' },
};

export function TransactionsTable({
  transactions,
  isLoading,
  onEdit,
  onDelete,
  onReconcile,
}: TransactionsTableProps) {
  return (
    <div className="rounded-md border">
      <table className="w-full text-sm" role="table" aria-label="Transactions">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-3 text-left font-medium" scope="col">Date</th>
            <th className="px-4 py-3 text-left font-medium" scope="col">Libellé</th>
            <th className="px-4 py-3 text-left font-medium" scope="col">Type</th>
            <th className="px-4 py-3 text-right font-medium" scope="col">Montant</th>
            <th className="px-4 py-3 text-left font-medium" scope="col">Statut</th>
            <th className="px-4 py-3 text-right font-medium" scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                Chargement...
              </td>
            </tr>
          ) : transactions.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                Aucune transaction
              </td>
            </tr>
          ) : (
            transactions.map((t) => {
              const status = STATUS_LABELS[t.status] || STATUS_LABELS.pending;
              return (
                <tr key={t.id} className="border-t hover:bg-accent">
                  <td className="px-4 py-3">
                    <time dateTime={t.date}>{formatFrenchDate(t.date)}</time>
                  </td>
                  <td className="px-4 py-3">{t.label}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.type === 'credit' ? 'success' : 'destructive'}>
                      {TYPE_LABELS[t.type]}
                    </Badge>
                  </td>
                  <td
                    className={cn('px-4 py-3 text-right font-medium', t.type === 'credit' ? 'text-green-600' : 'text-red-600')}
                  >
                    {t.type === 'credit' ? '+' : '-'}{formatFrenchCurrency(t.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit?.(t)}
                        aria-label={`Modifier ${t.label}`}
                      >
                        ✏️
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onReconcile?.(t.id)}
                        aria-label={`Réconcilier ${t.label}`}
                      >
                        🔄
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete?.(t.id)}
                        aria-label={`Supprimer ${t.label}`}
                        className="text-destructive"
                      >
                        🗑️
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
