'use client';

import { useState, useMemo, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatFrenchCurrency, formatFrenchDate } from '@/lib/formatters';
import type { Invoice } from '@/types/invoice';

interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading?: boolean;
  onView: (invoice: Invoice) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}

const STATUS_COLORS: Record<Invoice['status'], string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  viewed: 'bg-purple-100 text-purple-800',
  partial: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  void: 'bg-neutral-100 text-neutral-800',
};

const STATUS_LABELS: Record<Invoice['status'], string> = {
  draft: 'Brouillon',
  sent: 'Envoyée',
  viewed: 'Consultée',
  partial: 'Partiellement payée',
  paid: 'Payée',
  overdue: 'En retard',
  void: 'Annulée',
};

export function InvoiceTable({
  invoices,
  isLoading,
  onView,
  onSelectionChange,
}: InvoiceTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allSelected = useMemo(() => {
    return invoices.length > 0 && invoices.every((inv) => selectedIds.has(inv.id));
  }, [invoices, selectedIds]);

  const someSelected = useMemo(() => {
    return invoices.some((inv) => selectedIds.has(inv.id)) && !allSelected;
  }, [invoices, selectedIds, allSelected]);

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
      onSelectionChange?.([]);
    } else {
      const ids = new Set(invoices.map((inv) => inv.id));
      setSelectedIds(ids);
      onSelectionChange?.(Array.from(ids));
    }
  }, [allSelected, invoices, onSelectionChange]);

  const toggleRow = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        onSelectionChange?.(Array.from(next));
        return next;
      });
    },
    [onSelectionChange]
  );

  return (
    <div className="rounded-md border">
      <table className="w-full text-sm" role="table" aria-label="Factures">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-3 w-10" scope="col">
              <input
                type="checkbox"
                role="checkbox"
                aria-label="Tout sélectionner"
                className="h-4 w-4 cursor-pointer accent-primary"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onChange={toggleAll}
              />
            </th>
            <th className="px-4 py-3 text-left font-medium" scope="col">
              Numéro
            </th>
            <th className="px-4 py-3 text-left font-medium" scope="col">
              Client
            </th>
            <th className="px-4 py-3 text-left font-medium" scope="col">
              Date
            </th>
            <th className="px-4 py-3 text-left font-medium" scope="col">
              Échéance
            </th>
            <th className="px-4 py-3 text-right font-medium" scope="col">
              Total
            </th>
            <th className="px-4 py-3 text-left font-medium" scope="col">
              Statut
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center">
                Chargement...
              </td>
            </tr>
          ) : invoices.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                Aucune facture trouvée
              </td>
            </tr>
          ) : (
            invoices.map((invoice) => {
              const isSelected = selectedIds.has(invoice.id);
              return (
                <tr
                  key={invoice.id}
                  className={cn(
                    'border-t cursor-pointer transition-colors',
                    isSelected ? 'bg-muted/80' : 'hover:bg-accent'
                  )}
                  onClick={() => onView(invoice)}
                  tabIndex={0}
                  role="button"
                  aria-selected={isSelected}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onView(invoice);
                  }}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      role="checkbox"
                      aria-label={`Sélectionner ${invoice.number}`}
                      className="h-4 w-4 cursor-pointer accent-primary"
                      checked={isSelected}
                      onChange={() => toggleRow(invoice.id)}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{invoice.number}</td>
                  <td className="px-4 py-3">{invoice.clientName}</td>
                  <td className="px-4 py-3">
                    <time dateTime={invoice.date}>
                      {formatFrenchDate(invoice.date)}
                    </time>
                  </td>
                  <td className="px-4 py-3">
                    <time dateTime={invoice.dueDate}>
                      {formatFrenchDate(invoice.dueDate)}
                    </time>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatFrenchCurrency(invoice.total)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="default"
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        STATUS_COLORS[invoice.status]
                      )}
                    >
                      {STATUS_LABELS[invoice.status]}
                    </Badge>
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