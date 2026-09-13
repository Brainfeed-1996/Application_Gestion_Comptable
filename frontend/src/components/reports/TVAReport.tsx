'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { formatFrenchCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { TVAReport } from '@/types/tax';

interface TVAReportProps {
  data?: TVAReport;
}

const PERIODS = [
  { value: 'q1', label: 'T1 2026' },
  { value: 'q2', label: 'T2 2026' },
  { value: 'q3', label: 'T3 2026' },
  { value: 'q4', label: 'T4 2026' },
];

export function TVAReport({ data }: TVAReportProps) {
  const [period, setPeriod] = useState('q3');

  const defaultData: TVAReport = {
    period: 'T3 2026',
    collectedTVA: 9040,
    deductibleTVA: 1590,
    tvaDue: 7450,
    breakdown: [
      { rate: 20, collected: 7440, deductible: 1200, due: 6240 },
      { rate: 10, collected: 1200, deductible: 300, due: 900 },
      { rate: 5.5, collected: 400, deductible: 90, due: 310 },
    ],
  };

  const report = data || defaultData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Déclaration TVA</h2>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod} aria-label="Période">
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </Select>
          <Button variant="outline">📄 PDF</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-purple-300">
          <CardHeader><CardTitle className="text-purple-700">TVA collectée</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-purple-600">{formatFrenchCurrency(report.collectedTVA)}</p></CardContent>
        </Card>
        <Card className="border-orange-300">
          <CardHeader><CardTitle className="text-orange-700">TVA déductible</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-orange-600">{formatFrenchCurrency(report.deductibleTVA)}</p></CardContent>
        </Card>
        <Card className="border-primary">
          <CardHeader><CardTitle className="text-primary">TVA due</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-primary">{formatFrenchCurrency(report.tvaDue)}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Détail par taux</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm" role="table">
            <thead className="border-b">
              <tr>
                <th className="text-left py-2">Taux</th>
                <th className="text-right py-2">Collectée</th>
                <th className="text-right py-2">Déductible</th>
                <th className="text-right py-2">Due</th>
              </tr>
            </thead>
            <tbody>
              {report.breakdown.map((item) => (
                <tr key={item.rate} className="border-b">
                  <td className="py-2">{item.rate}%</td>
                  <td className="py-2 text-right">{formatFrenchCurrency(item.collected)}</td>
                  <td className="py-2 text-right">{formatFrenchCurrency(item.deductible)}</td>
                  <td className="py-2 text-right font-medium">{formatFrenchCurrency(item.due)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold">
                <td className="py-3">Total</td>
                <td className="py-3 text-right">{formatFrenchCurrency(report.collectedTVA)}</td>
                <td className="py-3 text-right">{formatFrenchCurrency(report.deductibleTVA)}</td>
                <td className="py-3 text-right">{formatFrenchCurrency(report.tvaDue)}</td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
