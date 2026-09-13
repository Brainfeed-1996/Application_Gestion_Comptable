'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { formatFrenchCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { BilanData } from '@/types/tax';

interface BilanReportProps {
  data?: BilanData;
}

export function BilanReport({ data }: BilanReportProps) {
  const [date, setDate] = useState('');

  const defaultData: BilanData = {
    date: '2026-09-30',
    assets: {
      items: [
        { id: '1', label: 'Trésorerie', code: '512', amount: 125430.5 },
        { id: '2', label: 'Créances clients', code: '511', amount: 45200 },
        { id: '3', label: 'Stocks', code: '513', amount: 18750 },
        { id: '4', label: 'Immobilisations', code: '520', amount: 85000 },
      ],
      total: 274380.5,
    },
    liabilities: {
      items: [
        { id: '1', label: 'Dettes fournisseurs', code: '512', amount: 32500 },
        { id: '2', label: 'Emprunts', code: '520', amount: 45000 },
        { id: '3', label: 'Dettes fiscales', code: '530', amount: 7450 },
      ],
      total: 84950,
    },
    equity: {
      items: [
        { id: '1', label: 'Capital social', code: '100', amount: 100000 },
        { id: '2', label: 'Réserves', code: '110', amount: 5430.5 },
        { id: '3', label: 'Résultat net', code: '120', amount: 34000 },
      ],
      total: 139430.5,
    },
  };

  const bilan = data || defaultData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Bilan</h2>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-40"
            aria-label="Date du bilan"
          />
          <Button variant="outline" aria-label="Exporter en PDF">📄 PDF</Button>
          <Button variant="outline" aria-label="Exporter en Excel">📊 Excel</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="bg-green-50 dark:bg-green-900/20">
            <CardTitle className="text-green-800 dark:text-green-200">🟢 Actif</CardTitle>
            <p className="text-sm text-green-600">Total: {formatFrenchCurrency(bilan.assets.total)}</p>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm" role="table">
              <tbody>
                {bilan.assets.items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2">
                      <span className="font-mono text-xs text-muted-foreground">{item.code}</span>{' '}
                      {item.label}
                    </td>
                    <td className="py-2 text-right font-medium">{formatFrenchCurrency(item.amount)}</td>
                  </tr>
                ))}
                <tr className="font-bold">
                  <td className="py-3">Total Actif</td>
                  <td className="py-3 text-right">{formatFrenchCurrency(bilan.assets.total)}</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="bg-red-50 dark:bg-red-900/20">
              <CardTitle className="text-red-800 dark:text-red-200">🔴 Passif</CardTitle>
              <p className="text-sm text-red-600">Total: {formatFrenchCurrency(bilan.liabilities.total)}</p>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm" role="table">
                <tbody>
                  {bilan.liabilities.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2">
                        <span className="font-mono text-xs text-muted-foreground">{item.code}</span>{' '}
                        {item.label}
                      </td>
                      <td className="py-2 text-right font-medium">{formatFrenchCurrency(item.amount)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold">
                    <td className="py-3">Total Passif</td>
                    <td className="py-3 text-right">{formatFrenchCurrency(bilan.liabilities.total)}</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
              <CardTitle className="text-blue-800 dark:text-blue-200">🔵 Capitaux propres</CardTitle>
              <p className="text-sm text-blue-600">Total: {formatFrenchCurrency(bilan.equity.total)}</p>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm" role="table">
                <tbody>
                  {bilan.equity.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2">
                        <span className="font-mono text-xs text-muted-foreground">{item.code}</span>{' '}
                        {item.label}
                      </td>
                      <td className="py-2 text-right font-medium">{formatFrenchCurrency(item.amount)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold">
                    <td className="py-3">Total Capitaux Propres</td>
                    <td className="py-3 text-right">{formatFrenchCurrency(bilan.equity.total)}</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className={cn(
            'rounded-lg border p-4',
            Math.abs(bilan.assets.total - bilan.liabilities.total - bilan.equity.total) < 0.01
              ? 'bg-green-50 border-green-200'
              : 'bg-yellow-50 border-yellow-200'
          )}>
            <p className="font-medium">
              Vérification: Actif = Passif + Capitaux Propres
            </p>
            <p className="text-sm text-muted-foreground">
              {formatFrenchCurrency(bilan.assets.total)} = {formatFrenchCurrency(bilan.liabilities.total + bilan.equity.total)}
              {Math.abs(bilan.assets.total - bilan.liabilities.total - bilan.equity.total) < 0.01
                ? ' ✅ Équilibré'
                : ' ⚠️ Déséquilibre détecté'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
