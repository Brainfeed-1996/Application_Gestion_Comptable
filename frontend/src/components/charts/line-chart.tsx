"use client";

interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  showPoints?: boolean;
  showArea?: boolean;
  color?: string;
  strokeDash?: boolean;
}

export default function LineChart({
  data,
  height = 320,
  showPoints = true,
  showArea = true,
  color = "#3b82f6",
  strokeDash = false,
}: LineChartProps) {
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

  const min = Math.min(...data.map((d) => d.value));
  const max = Math.max(...data.map((d) => d.value));
  const range = max - min || 1;

  const padding = { top: 20, right: 20, bottom: 40, left: 10 };
  const chartW = 600;
  const chartH = height;
  const plotW = chartW - padding.left - padding.right;
  const plotH = chartH - padding.top - padding.bottom;

  const getX = (i: number) =>
    padding.left + (data.length === 1 ? plotW / 2 : (i / (data.length - 1)) * plotW);
  const getY = (v: number) =>
    padding.top + plotH - ((v - min) / range) * plotH;

  const points = data.map((d, i) => ({ x: getX(i), y: getY(d.value), ...d }));
  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${(chartH - padding.bottom).toFixed(1)} L ${points[0].x.toFixed(1)} ${(chartH - padding.bottom).toFixed(1)} Z`;

  // Y-axis ticks
  const tickCount = 5;
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const value = min + (range * i) / (tickCount - 1);
    return { value, y: getY(value) };
  });

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${chartW} ${chartH}`}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines + Y labels */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={t.y}
              x2={chartW - padding.right}
              y2={t.y}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
            <text
              x={padding.left - 6}
              y={t.y + 4}
              textAnchor="end"
              className="fill-gray-500"
              style={{ fontSize: 11 }}
            >
              {t.value.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}
            </text>
          </g>
        ))}

        {/* Area fill */}
        {showArea && <path d={areaD} fill="url(#areaGrad)" />}

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeDasharray={strokeDash ? "6 4" : undefined}
          className="transition-all duration-300"
        />

        {/* Points */}
        {showPoints &&
          points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={4}
              fill="#fff"
              stroke={color}
              strokeWidth={2}
              className="transition-all duration-300"
            />
          ))}

        {/* X labels */}
        {data.map((d, i) => {
          const p = points[i];
          return (
            <text
              key={i}
              x={p.x}
              y={chartH - padding.bottom + 20}
              textAnchor="middle"
              className="fill-gray-600"
              style={{ fontSize: 11 }}
            >
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}