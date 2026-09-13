'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { formatFrenchCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { CRData } from '@/types/tax';

interface CRReportProps {
  data?: CRData;
}

const PERIODS = [
  { value: 'q1', label: 'T1 2026' },
  { value: 'q2', label: 'T2 2026' },
  { value: 'q3', label: 'T3 2026' },
  { value: 'q4', label: 'T4 2026' },
];

export function CRReport({ data }: CRReportProps) {
  const [period, setPeriod] = useState('q3');

  const defaultData: CRData = {
    period: 'T3 2026',
    revenues: 45200,
    expenses: 28750,
    netIncome: 16450,
    details: [
      { id: '1', label: 'Prestations', amount: 28000, type: 'revenue' },
      { id: '2', label: 'Conseil', amount: 17200, type: 'revenue' },
      { id: '3', label: 'Loyer', amount: 8500, type: 'expense' },
      { id: '4', label: 'Salaires', amount: 12250, type: 'expense' },
      { id: '5', label: 'Fournitures', amount: 8000, type: 'expense' },
    ],
  };

  const report = data || defaultData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Compte de résultat</h2>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod} aria-label="Période">
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </Select>
          <Button variant="outline" aria-label="Exporter en PDF">📄 PDF</Button>
          <Button variant="outline" aria-label="Exporter en Excel">📊 Excel</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-green-300">
          <CardHeader><CardTitle className="text-green-700">Revenus</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{formatFrenchCurrency(report.revenues)}</p>
          </CardContent>
        </Card>
        <Card className="border-red-300">
          <CardHeader><CardTitle className="text-red-700">Dépenses</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{formatFrenchCurrency(report.expenses)}</p>
          </CardContent>
        </Card>
        <Card className="border-blue-300">
          <CardHeader><CardTitle className="text-blue-700">Résultat net</CardTitle></CardHeader>
          <CardContent>
            <p className={cn('text-3xl font-bold', report.netIncome >= 0 ? 'text-green-600' : 'text-red-600')}>
              {formatFrenchCurrency(report.netIncome)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Détail</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm" role="table">
            <thead className="border-b">
              <tr>
                <th className="text-left py-2">Catégorie</th>
                <th className="text-left py-2">Type</th>
                <th className="text-right py-2">Montant</th>
              </tr>
            </thead>
            <tbody>
              {report.details.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2">{item.label}</td>
                  <td className="py-2">
                    <span className={cn(
                      'text-xs',
                      item.type === 'revenue' ? 'text-green-600' : 'text-red-600'
                    )}>
                      {item.type === 'revenue' ? 'Recette' : 'Dépense'}
                    </span>
                  </td>
                  <td className={cn('py-2 text-right font-medium', item.type === 'revenue' ? 'text-green-600' : 'text-red-600')}>
                    {item.type === 'revenue' ? '+' : '-'}{formatFrenchCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold">
                <td className="py-3" colSpan={2}>Résultat net</td>
                <td className={cn('py-3 text-right', report.netIncome >= 0 ? 'text-green-600' : 'text-red-600')}>
                  {formatFrenchCurrency(report.netIncome)}
                </td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
