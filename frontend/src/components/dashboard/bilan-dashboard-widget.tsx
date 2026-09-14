'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatFrenchCurrency } from '@/lib/formatters';
import LineChart from '@/components/charts/line-chart';

interface BilanDashboardWidgetProps {
  actif?: number;
  passif?: number;
  netWorthTrend?: { label: string; value: number }[];
  href?: string;
}

const DEFAULT_TREND: { label: string; value: number }[] = [
  { label: 'Jan', value: 12500 },
  { label: 'Fév', value: 18200 },
  { label: 'Mar', value: 15400 },
  { label: 'Avr', value: 22100 },
  { label: 'Mai', value: 19800 },
  { label: 'Jun', value: 24300 },
];

export function BilanDashboardWidget({
  actif = 85420,
  passif = 61120,
  netWorthTrend = DEFAULT_TREND,
  href = '/bilan',
}: BilanDashboardWidgetProps) {
  const netWorth = useMemo(() => actif - passif, [actif, passif]);
  const isPositive = netWorth >= 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Bilan</CardTitle>
        <Badge variant={isPositive ? 'success' : 'error'} className="text-xs">
          {isPositive ? 'Équilibré' : 'Déséquilibré'}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Actif</p>
            <p className="text-sm font-bold text-blue-600">
              {formatFrenchCurrency(actif)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Passif</p>
            <p className="text-sm font-bold text-purple-600">
              {formatFrenchCurrency(passif)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Net</p>
            <p
              className={cn(
                'text-sm font-bold',
                isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {formatFrenchCurrency(netWorth)}
            </p>
          </div>
        </div>

        <LineChart
          data={netWorthTrend}
          height={160}
          showArea={true}
          color={isPositive ? '#22c55e' : '#ef4444'}
          showPoints={false}
        />

        <a
          href={href}
          aria-label="Voir le bilan complet"
          className={cn(
            'inline-flex w-full items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 mt-4'
          )}
        >
          Voir le bilan complet
        </a>
      </CardContent>
    </Card>
  );
}

export default BilanDashboardWidget;