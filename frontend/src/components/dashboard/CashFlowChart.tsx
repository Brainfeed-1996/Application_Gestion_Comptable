'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { formatFrenchCurrency } from '@/lib/formatters';

const PERIODS = [
  { value: 'week', label: 'Semaine' },
  { value: 'month', label: 'Mois' },
  { value: 'quarter', label: 'Trimestre' },
  { value: 'year', label: 'Année' },
];

interface CashFlowChartProps {
  period?: string;
}

export function CashFlowChart({ period = 'month' }: CashFlowChartProps) {
  const chartData = useMemo(() => {
    const labels =
      period === 'week'
        ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
        : period === 'month'
        ? ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']
        : period === 'quarter'
        ? ['Jan', 'Fév', 'Mar']
        : ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

    return labels.map((label) => ({
      label,
      inflows: Math.round(Math.random() * 15000 + 5000),
      outflows: Math.round(Math.random() * 10000 + 3000),
    }));
  }, [period]);

  const maxValue = Math.max(
    ...chartData.map((d) => Math.max(d.inflows, d.outflows))
  );
  const chartHeight = 200;
  const chartWidth = 600;
  const padding = 40;
  const barWidth = chartData.length > 7 ? 20 : 40;
  const gap =
    (chartWidth - padding * 2 - barWidth * chartData.length) / (chartData.length + 1);

  const totalInflows = chartData.reduce((s, d) => s + d.inflows, 0);
  const totalOutflows = chartData.reduce((s, d) => s + d.outflows, 0);

  return (
    <div className="space-y-4" role="region" aria-label="Graphique flux de trésorerie">
      <div className="flex items-center justify-between">
        <Select value={period} aria-label="Sélectionner la période du graphique">
          {PERIODS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </Select>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-green-500" aria-hidden="true" />
            <span>Entrants</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-red-500" aria-hidden="true" />
            <span>Sortants</span>
          </div>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full"
        role="img"
        aria-label={`Graphique des flux: entrants ${formatFrenchCurrency(totalInflows)}, sortants ${formatFrenchCurrency(totalOutflows)}`}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding + (chartHeight - padding * 2) * ratio;
          return (
            <g key={ratio}>
              <line
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text x={padding - 5} y={y + 4} textAnchor="end" fontSize="10" fill="#6b7280">
                {formatFrenchCurrency(maxValue * ratio)}
              </text>
            </g>
          );
        })}

        {chartData.map((d, i) => {
          const x = padding + gap + i * (barWidth + gap);
          const inflowHeight = (d.inflows / maxValue) * (chartHeight - padding * 2);
          const outflowHeight = (d.outflows / maxValue) * (chartHeight - padding * 2);

          return (
            <g key={d.label}>
              <rect
                x={x}
                y={padding + (chartHeight - padding * 2) - inflowHeight}
                width={barWidth / 2 - 2}
                height={inflowHeight}
                fill="#22c55e"
                rx="2"
              />
              <rect
                x={x + barWidth / 2 + 2}
                y={padding + (chartHeight - padding * 2) - outflowHeight}
                width={barWidth / 2 - 2}
                height={outflowHeight}
                fill="#ef4444"
                rx="2"
              />
              <text
                x={x + barWidth / 2}
                y={chartHeight - 10}
                textAnchor="middle"
                fontSize="10"
                fill="#6b7280"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total Entrants</p>
            <p className="text-lg font-bold text-green-600">{formatFrenchCurrency(totalInflows)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total Sortants</p>
            <p className="text-lg font-bold text-red-600">{formatFrenchCurrency(totalOutflows)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Net</p>
            <p
              className={cn(
                'text-lg font-bold',
                totalInflows - totalOutflows >= 0 ? 'text-green-600' : 'text-red-600'
              )}
            >
              {formatFrenchCurrency(totalInflows - totalOutflows)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
