'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CashFlowChart } from '@/components/dashboard/CashFlowChart';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

const PERIODS = [
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
  { value: 'quarter', label: 'Ce trimestre' },
  { value: 'year', label: 'Cette année' },
];

export default function CashFlowPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [period, setPeriod] = useState('month');

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
            <h2 className="text-2xl font-bold">Flux de trésorerie</h2>
            <p className="text-muted-foreground">Suivez vos entrants et sortants de trésorerie</p>
          </div>
          <Select value={period} onValueChange={setPeriod} aria-label="Période">
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </Select>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border bg-green-50 p-6 dark:bg-green-900/20">
            <p className="text-sm font-medium text-green-700">Entrants</p>
            <p className="text-3xl font-bold text-green-600 mt-1">45 200,00 €</p>
          </div>
          <div className="rounded-lg border bg-red-50 p-6 dark:bg-red-900/20">
            <p className="text-sm font-medium text-red-700">Sortants</p>
            <p className="text-3xl font-bold text-red-600 mt-1">28 750,00 €</p>
          </div>
          <div className="rounded-lg border bg-blue-50 p-6 dark:bg-blue-900/20">
            <p className="text-sm font-medium text-blue-700">Solde net</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">16 450,00 €</p>
          </div>
        </div>

        <div className="rounded-lg border">
          <CashFlowChart period={period} />
        </div>

        <Button variant="outline">
          📊 Exporter
        </Button>
      </div>
    </DashboardLayout>
  );
}
