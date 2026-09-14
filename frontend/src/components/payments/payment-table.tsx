'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { formatFrenchCurrency, formatFrenchDate } from '@/lib/formatters';
import type { Payment, PaymentCreate, PaymentMethod, PaymentStatus } from '@/types/payment';
import type { Invoice } from '@/types/invoice';

interface PaymentTableProps {
  payments: Payment[];
  invoices?: Invoice[];
  isLoading?: boolean;
  onEdit?: (payment: Payment) => void;
  onDelete?: (id: string) => void;
}

const METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Espèces',
  card: 'Carte bancaire',
  transfer: 'Virement',
  cheque: 'Chèque',
};

const STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'En attente',
  completed: 'Complété',
  failed: 'Échoué',
  refunded: 'Remboursé',
};

const STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-blue-100 text-blue-800',
};

export function PaymentTable({
  payments,
  invoices = [],
  isLoading,
  onEdit,
  onDelete,
}: PaymentTableProps) {
  const getInvoiceNumber = (invoiceId: string): string => {
    const inv = invoices.find((i) => i.id === invoiceId);
    return inv?.invoice_number || invoiceId.slice(0, 8);
  };

  return (
    <div className="rounded-md border">
      <table className="w-full text-sm" role="table" aria-label="Paiements">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-3 text-left font-medium" scope="col">Date</th>
            <th className="px-4 py-3 text-left font-medium" scope="col">Facture</th>
            <th className="px-4 py-3 text-right font-medium" scope="col">Montant</th>
            <th className="px-4 py-3 text-left font-medium" scope="col">Mode</th>
            <th className="px-4 py-3 text-left font-medium" scope="col">Statut</th>
            <th className="px-4 py-3 text-left font-medium" scope="col">Référence</th>
            <th className="px-4 py-3 text-right font-medium" scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center">
                Chargement...
              </td>
            </tr>
          ) : payments.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                Aucun paiement trouvé
              </td>
            </tr>
          ) : (
            payments.map((payment) => (
              <tr key={payment.id} className="border-t hover:bg-accent">
                <td className="px-4 py-3">
                  <time dateTime={payment.payment_date}>
                    {formatFrenchDate(payment.payment_date)}
                  </time>
                </td>
                <td className="px-4 py-3 font-medium">
                  {getInvoiceNumber(payment.invoice_id)}
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {formatFrenchCurrency(payment.amount)}
                </td>
                <td className="px-4 py-3">
                  {METHOD_LABELS[payment.method]}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      STATUS_COLORS[payment.status]
                    )}
                  >
                    {STATUS_LABELS[payment.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {payment.reference || '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(payment)}
                        aria-label={`Modifier ${payment.id}`}
                      >
                        Modifier
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => onDelete(payment.id)}
                        aria-label={`Supprimer ${payment.id}`}
                      >
                        Supprimer
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}