"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/charts";

export interface WaterfallEntry {
  label: string;
  value: number;
}

export interface BilanWaterfallProps {
  data: WaterfallEntry[];
  currency?: string;
  height?: number;
  className?: string;
}

export default function BilanWaterfall({
  data,
  currency = "EUR",
  height = 350,
  className = "",
}: BilanWaterfallProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    let cumulative = 0;
    const entries = data.map((d) => {
      const start = cumulative;
      cumulative += d.value;
      return {
        label: d.label,
        value: d.value,
        start,
        end: cumulative,
      };
    });

    const allValues = entries.flatMap((e) => [e.start, e.end]);
    const min = Math.min(...allValues, 0);
    const max = Math.max(...allValues, 0);
    const range = max - min || 1;

    return { entries, min, max, range };
  }, [data]);

  if (!chartData) {
    return (
      <div className={`flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500`} style={{ height }}>
        Aucune donnée
      </div>
    );
  }

  const { entries, min, range } = chartData;
  const chartH = height - 60;
  const chartW = 600;
  const padding = { top: 20, right: 20, bottom: 50, left: 60 };
  const plotW = chartW - padding.left - padding.right;
  const plotH = chartH - padding.top - padding.bottom;
  const barWidth = Math.min(60, (plotW / entries.length) * 0.6);
  const gap = (plotW - entries.length * barWidth) / (entries.length + 1);

  const getY = (v: number) =>
    padding.top + plotH - ((v - min) / range) * plotH;

  return (
    <div className={`w-full ${className}`}>
      <Card className="border-gray-200">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-gray-800">
            Évolution du Bilan
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full"
              style={{ height }}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((f) => {
                const y = padding.top + plotH - f * plotH;
                return (
                  <g key={f}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={chartW - padding.right}
                      y2={y}
                      stroke="#e5e7eb"
                      strokeWidth={1}
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 4}
                      textAnchor="end"
                      className="fill-gray-500"
                      style={{ fontSize: 10 }}
                    >
                      {((min + f * range) / 1000).toFixed(0)}k
                    </text>
                  </g>
                );
              })}

              {/* Bars and connectors */}
              {entries.map((entry, i) => {
                const x = padding.left + gap + i * (barWidth + gap);
                const isPositive = entry.value >= 0;
                const barColor = isPositive ? "#10b981" : "#ef4444";
                const y1 = getY(entry.start);
                const y2 = getY(entry.end);
                const barH = Math.abs(y2 - y1);
                const baseY = isPositive ? y1 : y2;

                return (
                  <g key={entry.label}>
                    {/* Connector line from previous bar */}
                    {i > 0 && (
                      <line
                        x1={padding.left + gap + (i - 1) * (barWidth + gap) + barWidth}
                        y1={getY(entries[i - 1].end)}
                        x2={x}
                        y2={getY(entry.start)}
                        stroke="#9ca3af"
                        strokeWidth={1}
                        strokeDasharray="4 2"
                      />
                    )}
                    {/* Bar */}
                    <rect
                      x={x}
                      y={baseY}
                      width={barWidth}
                      height={Math.max(barH, 1)}
                      fill={barColor}
                      rx={3}
                      className="transition-all duration-300 hover:opacity-80"
                    />
                    {/* Value label */}
                    <text
                      x={x + barWidth / 2}
                      y={isPositive ? baseY - 6 : baseY + barH + 14}
                      textAnchor="middle"
                      className="fill-gray-700"
                      style={{ fontSize: 10, fontWeight: 600 }}
                    >
                      {formatCurrency(entry.value, currency)}
                    </text>
                    {/* X label */}
                    <text
                      x={x + barWidth / 2}
                      y={chartH - padding.bottom + 18}
                      textAnchor="end"
                      className="fill-gray-600"
                      style={{ fontSize: 10 }}
                      transform={`rotate(-30, ${x + barWidth / 2}, ${chartH - padding.bottom + 18})`}
                    >
                      {entry.label}
                    </text>
                  </g>
                );
              })}

              {/* Running total line */}
              {entries.length > 1 && (
                <path
                  d={entries
                    .map((entry, i) => {
                      const x = padding.left + gap + i * (barWidth + gap) + barWidth / 2;
                      const y = getY(entry.end);
                      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  opacity={0.6}
                />
              )}
            </svg>
          </div>

          {/* Legend */}
          <div className="mt-2 flex justify-center gap-6 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-green-500" />
              Augmentation
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-red-500" />
              Diminution
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-6 bg-indigo-500" style={{ borderTop: "2px dashed #6366f1" }} />
              Total cumulé
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
