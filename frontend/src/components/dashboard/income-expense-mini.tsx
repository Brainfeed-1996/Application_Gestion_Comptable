'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatFrenchCurrency } from '@/lib/formatters';
import BarChart from '@/components/charts/bar-chart';

interface IncomeExpenseMiniProps {
  data?: { label: string; income: number; expense: number }[];
  title?: string;
}

const DEFAULT_DATA: { label: string; income: number; expense: number }[] = [
  { label: 'Jan', income: 42000, expense: 28000 },
  { label: 'Fév', income: 38000, expense: 31000 },
  { label: 'Mar', income: 45000, expense: 29500 },
  { label: 'Avr', income: 51000, expense: 33000 },
  { label: 'Mai', income: 47000, expense: 30500 },
  { label: 'Jun', income: 54000, expense: 32000 },
];

export function IncomeExpenseMini({
  data = DEFAULT_DATA,
  title = 'Revenus vs Dépenses',
}: IncomeExpenseMiniProps) {
  const chartData = useMemo(
    () =>
      data.flatMap((d) => [
        { label: d.label, value: d.income },
        { label: d.label, value: -d.expense },
      ]),
    [data]
  );

  const totalIncome = useMemo(
    () => data.reduce((s, d) => s + d.income, 0),
    [data]
  );
  const totalExpense = useMemo(
    () => data.reduce((s, d) => s + d.expense, 0),
    [data]
  );
  const net = totalIncome - totalExpense;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Revenus</p>
            <p className="text-sm font-bold text-green-600">
              {formatFrenchCurrency(totalIncome)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Dépenses</p>
            <p className="text-sm font-bold text-red-600">
              {formatFrenchCurrency(totalExpense)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Net</p>
            <p
              className={cn(
                'text-sm font-bold',
                net >= 0 ? 'text-green-600' : 'text-red-600'
              )}
            >
              {formatFrenchCurrency(net)}
            </p>
          </div>
        </div>

        <BarChart
          data={chartData}
          height={220}
          showValues={false}
          orientation="horizontal"
        />

        <div className="flex items-center justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-green-500" aria-hidden="true" />
            Revenus
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-red-500" aria-hidden="true" />
            Dépenses
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default IncomeExpenseMini;