'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { formatFrenchCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { AlertsList } from './AlertsList';
import { MetricsCards } from './MetricsCards';
import { CashFlowChart } from './CashFlowChart';

const PERIODS = [
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
  { value: 'quarter', label: 'Ce trimestre' },
  { value: 'year', label: 'Cette année' },
];

export function Dashboard360() {
  const [period, setPeriod] = useState('month');
  const [showAlerts, setShowAlerts] = useState(false);

  const metrics = useMemo(
    () => [
      { label: 'Total Solde', value: 125430.5, change: 5.2, icon: '💰', color: 'default' },
      { label: 'Revenus', value: 45200, change: 12.5, icon: '📈', color: 'success' },
      { label: 'Dépenses', value: 28750, change: -3.1, icon: '📉', color: 'destructive' },
      { label: 'TVA Due', value: 7450, change: 2.0, icon: '📋', color: 'warning' },
    ],
    []
  );

  return (
    <div className="space-y-6" role="main" aria-label="Tableau de bord">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tableau de bord</h2>
          <p className="text-muted-foreground">Vue d'ensemble de votre activité comptable</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={period}
            onValueChange={setPeriod}
            label="Période"
            aria-label="Sélectionner la période"
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
          <Button
            variant={showAlerts ? 'default' : 'outline'}
            onClick={() => setShowAlerts(!showAlerts)}
            aria-expanded={showAlerts}
            aria-controls="alerts-section"
          >
            Alertes
          </Button>
        </div>
      </div>

      <MetricsCards metrics={metrics} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Flux de trésorerie</CardTitle>
          </CardHeader>
          <CardContent>
            <CashFlowChart period={period} />
          </CardContent>
        </Card>

        {showAlerts && (
          <Card id="alerts-section" className="md:col-span-1">
            <CardHeader>
              <CardTitle>Alertes récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <AlertsList limit={5} />
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenus vs Dépenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" aria-hidden="true" />
                  <span>Revenus</span>
                </div>
                <span className="font-medium">{formatFrenchCurrency(45200)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" aria-hidden="true" />
                  <span>Dépenses</span>
                </div>
                <span className="font-medium">{formatFrenchCurrency(28750)}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" aria-hidden="true" />
                  <span>TVA Due</span>
                </div>
                <span className="font-medium">{formatFrenchCurrency(7450)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dernières transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentTransactions />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RecentTransactions() {
  const transactions = [
    { id: '1', label: 'Facture ACME', amount: 1250, type: 'credit', date: '2026-09-10' },
    { id: '2', label: 'Loyer bureau', amount: 850, type: 'debit', date: '2026-09-09' },
    { id: '3', label: 'Prestation client', amount: 2400, type: 'credit', date: '2026-09-08' },
    { id: '4', label: 'Fournitures', amount: 320, type: 'debit', date: '2026-09-07' },
    { id: '5', label: 'Remboursement', amount: 500, type: 'credit', date: '2026-09-06' },
  ];

  return (
    <ul className="space-y-3" aria-label="Transactions récentes">
      {transactions.map((t) => (
        <li key={t.id} className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{t.label}</p>
            <p className="text-xs text-muted-foreground">{t.date}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={t.type === 'credit' ? 'success' : 'destructive'}>
              {t.type === 'credit' ? 'Recette' : 'Dépense'}
            </Badge>
            <span
              className={cn(
                'text-sm font-medium',
                t.type === 'credit' ? 'text-green-600' : 'text-red-600'
              )}
            >
              {t.type === 'credit' ? '+' : '-'}{formatFrenchCurrency(t.amount)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
