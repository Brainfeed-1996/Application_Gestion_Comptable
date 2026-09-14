'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type AlertType = 'warning' | 'critical' | 'info';
export type AlertStatus = 'open' | 'acknowledged' | 'resolved';

export interface Alert {
  id: string;
  title: string;
  description: string;
  type: AlertType;
  status: AlertStatus;
  date: string;
}

const MOCK_ALERTS: Alert[] = [
  {
    id: '1',
    title: 'Facture en retard',
    description: 'Facture #INV-0042 dépasse le délai de paiement',
    type: 'critical',
    status: 'open',
    date: '2026-09-12',
  },
  {
    id: '2',
    title: 'Solde faible',
    description: 'Compte courant: solde inférieur à 1 000 €',
    type: 'warning',
    status: 'open',
    date: '2026-09-11',
  },
  {
    id: '3',
    title: 'TVA à déclarer',
    description: 'Déclaration TVA du 3e trimestre à soumettre avant le 30 septembre',
    type: 'info',
    status: 'open',
    date: '2026-09-10',
  },
  {
    id: '4',
    title: 'Transaction non réconciliée',
    description: '3 transactions en attente de rapprochement',
    type: 'warning',
    status: 'acknowledged',
    date: '2026-09-09',
  },
  {
    id: '5',
    title: 'Budget dépassé',
    description: 'Catégorie marketing dépasse de 15% le budget alloué',
    type: 'critical',
    status: 'resolved',
    date: '2026-09-08',
  },
];

interface AlertsListProps {
  limit?: number;
  filterType?: AlertType | 'all';
  filterStatus?: AlertStatus | 'all';
}

export function AlertsList({ limit, filterType = 'all', filterStatus = 'all' }: AlertsListProps) {
  const [typeFilter, setTypeFilter] = useState<AlertType | 'all'>(filterType);
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>(filterStatus);

  const filtered = MOCK_ALERTS.filter((a) => {
    if (typeFilter !== 'all' && a.type !== typeFilter) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    return true;
  }).slice(0, limit);

  const badgeVariant: Record<AlertType, 'destructive' | 'warning' | 'info' | 'default'> = {
    critical: 'destructive',
    warning: 'warning',
    info: 'info',
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as AlertType | 'all')}
          aria-label="Filtrer par type"
        >
          <option value="all">Tous types</option>
          <option value="critical">Critique</option>
          <option value="warning">Avertissement</option>
          <option value="info">Information</option>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as AlertStatus | 'all')}
          aria-label="Filtrer par statut"
        >
          <option value="all">Tous statuts</option>
          <option value="open">Ouvert</option>
          <option value="acknowledged">Reconnu</option>
          <option value="resolved">Résolu</option>
        </Select>
      </div>

      <ul className="space-y-2" aria-label="Liste des alertes">
        {filtered.map((alert) => (
          <li key={alert.id}>
            <div
              className={cn(
                'rounded-lg border p-3 transition-colors hover:bg-accent',
                alert.status === 'resolved' && 'opacity-50'
              )}
              role="alert"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={badgeVariant[alert.type]}>{alert.type}</Badge>
                    <Badge variant="secondary">{alert.status}</Badge>
                  </div>
                  <h4 className="mt-1 text-sm font-medium">{alert.title}</h4>
                  <p className="text-xs text-muted-foreground">{alert.description}</p>
                </div>
              </div>
              <time className="mt-2 text-xs text-muted-foreground">{alert.date}</time>
            </div>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-4">Aucune alerte</p>
      )}

      <Button variant="outline" className="w-full" aria-label="Voir toutes les alertes">
        Voir toutes les alertes
      </Button>
    </div>
  );
}
