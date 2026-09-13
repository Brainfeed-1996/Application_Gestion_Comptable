'use client';

import * as React from 'react';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
  type ChartType,
} from 'chart.js';
import { Chart as ChartComponent } from 'react-chartjs-2';
import { cn } from '@/lib/utils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

export type ChartKind = 'line' | 'bar' | 'pie' | 'doughnut';

export interface ChartProps {
  type: ChartKind;
  data: ChartData<ChartType>;
  options?: ChartOptions<ChartType>;
  loading?: boolean;
  height?: number | string;
  className?: string;
  ariaLabel?: string;
}

export function Chart({ type, data, options, loading = false, height = 320, className, ariaLabel = 'Graphique' }: ChartProps) {
  const chartData = React.useMemo(() => data, [data]);
  const chartOptions = React.useMemo<ChartOptions<ChartType>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#4b5563',
            usePointStyle: true,
          },
        },
      },
      ...options,
    }),
    [options],
  );

  return (
    <div
      className={cn('relative w-full rounded-lg bg-card p-2', className)}
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
    >
      {loading ? (
        <div
          role="status"
          aria-label="Chargement du graphique"
          className="flex h-full min-h-[12rem] items-center justify-center rounded-md bg-muted"
        >
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent text-primary" />
        </div>
      ) : (
        <div style={{ height: typeof height === 'number' ? `${height}px` : height }} className="w-full">
          <ChartComponent
            type={type}
            data={chartData}
            options={chartOptions}
            aria-label={ariaLabel}
            role="img"
          />
        </div>
      )}
    </div>
  );
}
