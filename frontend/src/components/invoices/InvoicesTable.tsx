'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { formatFrenchCurrency, formatFrenchDate } from '@/lib/formatters';
import type { Invoice, InvoiceStatus } from '@/types/invoice';

interface InvoicesTableProps {
  invoices: Invoice[];
  isLoading?: boolean;
  onCreate?: () => void;
  onView?: (inv: Invoice) => void;
  onSend?: (id: string) => void;
  onPay?: (id: string) => void;
  onDownload?: (id: string) => void;
  onCancel?: (id: string) => void;
}

const STATUS_VARIANTS: Record<InvoiceStatus, 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info'> = {
  draft: 'default',
  sent: 'info',
  paid: 'success',
  cancelled: 'destructive',
  overdue: 'warning',
};

export function InvoicesTable({
  invoices,
  isLoading,
  onCreate,
  onView,
  onSend,
  onPay,
  onDownload,
  onCancel,
}: InvoicesTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered =
    statusFilter === 'all'
      ? invoices
      : invoices.filter((i) => i.status === statusFilter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={statusFilter} onValueChange={setStatusFilter} aria-label="Filtrer par statut">
          <option value="all">Tous statuts</option>
          <option value="draft">Brouillon</option>
          <option value="sent">Envoyée</option>
          <option value="paid">Payée</option>
          <option value="cancelled">Annulée</option>
          <option value="overdue">En retard</option>
        </Select>
        <Button onClick={onCreate}>+ Nouvelle facture</Button>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm" role="table" aria-label="Factures">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left font-medium" scope="col">Numéro</th>
              <th className="px-4 py-3 text-left font-medium" scope="col">Client</th>
              <th className="px-4 py-3 text-left font-medium" scope="col">Statut</th>
              <th className="px-4 py-3 text-right font-medium" scope="col">Montant</th>
              <th className="px-4 py-3 text-left font-medium" scope="col">Date</th>
              <th className="px-4 py-3 text-right font-medium" scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center">Chargement...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Aucune facture</td></tr>
            ) : (
              filtered.map((inv) => (
                <tr key={inv.id} className="border-t hover:bg-accent">
                  <td className="px-4 py-3 font-medium">{inv.number}</td>
                  <td className="px-4 py-3">{inv.clientName}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANTS[inv.status]}>{inv.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{formatFrenchCurrency(inv.totalTTC)}</td>
                  <td className="px-4 py-3">
                    <time dateTime={inv.issueDate}>{formatFrenchDate(inv.issueDate)}</time>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => onView?.(inv)} aria-label={`Voir ${inv.number}`}>👁️</Button>
                      {inv.status === 'draft' && (
                        <Button variant="ghost" size="sm" onClick={() => onSend?.(inv.id)} aria-label={`Envoyer ${inv.number}`}>📤</Button>
                      )}
                      {inv.status === 'sent' && (
                        <Button variant="ghost" size="sm" onClick={() => onPay?.(inv.id)} aria-label={`Payer ${inv.number}`}>💳</Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => onDownload?.(inv.id)} aria-label={`Télécharger ${inv.number}`}>📄</Button>
                      {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                        <Button variant="ghost" size="sm" onClick={() => onCancel?.(inv.id)} aria-label={`Annuler ${inv.number}`} className="text-destructive">✕</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
