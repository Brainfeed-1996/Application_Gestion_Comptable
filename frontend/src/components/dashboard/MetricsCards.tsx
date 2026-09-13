'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatFrenchCurrency } from '@/lib/formatters';

interface Metric {
  label: string;
  value: number;
  change?: number;
  icon: string;
  color: 'default' | 'success' | 'warning' | 'destructive' | 'info';
}

interface MetricsCardsProps {
  metrics: Metric[];
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" role="region" aria-label="Statistiques clés">
      {metrics.map((metric) => (
        <Card key={metric.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.label}
            </CardTitle>
            <span aria-hidden="true" className="text-xl">{metric.icon}</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFrenchCurrency(metric.value)}</div>
            {metric.change !== undefined && (
              <p className={cn('text-xs mt-1', metric.change >= 0 ? 'text-green-600' : 'text-red-600')}>
                {metric.change >= 0 ? '↑' : '↓'} {Math.abs(metric.change)}%
                <span className="text-muted-foreground ml-1">vs période précédente</span>
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
