"use client";

import { getChartColor } from "@/lib/utils/charts";

interface PieChartProps {
  data: { label: string; value: number }[];
  height?: number;
  showLabels?: boolean;
  showPercent?: boolean;
  innerRadius?: number;
}

export default function PieChart({
  data,
  height = 320,
  showLabels = true,
  showPercent = true,
  innerRadius = 0,
}: PieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500"
        style={{ height }}
      >
        Aucune donnée
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500"
        style={{ height }}
      >
        Total nul
      </div>
    );
  }

  const cx = 300;
  const cy = height / 2;
  const radius = Math.min(cx, cy) - 20;
  const inner = (radius * innerRadius) / 100;

  let angle = -Math.PI / 2;

  const slices = data.map((d, i) => {
    const fraction = d.value / total;
    const sliceAngle = fraction * Math.PI * 2;
    const startAngle = angle;
    const endAngle = angle + sliceAngle;

    const x1 = cx + Math.cos(startAngle) * (inner || 0);
    const y1 = cy + Math.sin(startAngle) * (inner || 0);
    const x2 = cx + Math.cos(startAngle) * radius;
    const y2 = cy + Math.sin(startAngle) * radius;
    const x3 = cx + Math.cos(endAngle) * radius;
    const y3 = cy + Math.sin(endAngle) * radius;
    const x4 = cx + Math.cos(endAngle) * (inner || 0);
    const y4 = cy + Math.sin(endAngle) * (inner || 0);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    const path = inner > 0
      ? `M ${x1} ${y1} L ${x2} ${y2} A ${radius} ${radius} 0 ${largeArc} 1 ${x3} ${y3} L ${x4} ${y4} A ${inner} ${inner} 0 ${largeArc} 0 ${x1} ${y1} Z`
      : `M ${x2} ${y2} A ${radius} ${radius} 0 ${largeArc} 1 ${x3} ${y3} L ${cx} ${cy} Z`;

    // Label position (mid angle, 70% radius)
    const midAngle = startAngle + sliceAngle / 2;
    const labelR = radius * 0.72;
    const lx = cx + Math.cos(midAngle) * labelR;
    const ly = cy + Math.sin(midAngle) * labelR;

    angle = endAngle;

    return {
      path,
      label: d.label,
      value: d.value,
      percent: (fraction * 100).toFixed(1),
      lx,
      ly,
      color: getChartColor(i),
    };
  });

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${cx * 2} ${height}`}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="xMidYMid meet"
      >
        {slices.map((s, i) => (
          <g key={i}>
            <path
              d={s.path}
              fill={s.color}
              stroke="#fff"
              strokeWidth={2}
              className="transition-all duration-300 hover:opacity-80"
            />
            {showLabels && s.percent !== undefined && (
              <text
                x={s.lx}
                y={s.ly}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-white"
                style={{ fontSize: 11, fontWeight: 600 }}
              >
                {showPercent ? `${s.percent}%` : s.label}
              </text>
            )}
          </g>
        ))}
      </svg>
      {/* Legend */}
      <ul className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
        {slices.map((s, i) => (
          <li key={i} className="flex items-center gap-1.5 text-xs text-gray-700">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ backgroundColor: s.color }}
            />
            {s.label}
            <span className="text-gray-500">
              ({s.value.toLocaleString("fr-FR")} - {s.percent}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}