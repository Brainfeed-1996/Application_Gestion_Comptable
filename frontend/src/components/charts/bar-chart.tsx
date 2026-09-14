"use client";

interface BarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  showValues?: boolean;
  color?: string;
  orientation?: "vertical" | "horizontal";
}

export default function BarChart({
  data,
  height = 320,
  showValues = true,
  color = "#3b82f6",
  orientation = "vertical",
}: BarChartProps) {
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

  const max = Math.max(...data.map((d) => Math.abs(d.value)), 1);
  const chartHeight = height - 60;
  const chartWidth = "100%";
  const barWidth = orientation === "vertical" ? 48 : 24;
  const gap = 16;

  if (orientation === "horizontal") {
    const totalWidth = data.length * (barWidth + gap) + gap;
    return (
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${totalWidth} ${chartHeight}`}
          className="w-full"
          style={{ height }}
          preserveAspectRatio="xMidYMid meet"
        >
          {data.map((d, i) => {
            const x = i * (barWidth + gap) + gap;
            const barH = (Math.abs(d.value) / max) * (chartHeight - 40);
            const y = d.value >= 0 ? 10 : 10 + (chartHeight - 40) / 2 - barH;
            const labelY = chartHeight - 10;
            return (
              <g key={d.label}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  fill={color}
                  rx={4}
                  className="transition-all duration-300"
                />
                {showValues && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 6}
                    textAnchor="middle"
                    className="fill-gray-700 text-xs"
                    style={{ fontSize: 12 }}
                  >
                    {d.value.toLocaleString("fr-FR")}
                  </text>
                )}
                <text
                  x={x + barWidth / 2}
                  y={labelY}
                  textAnchor="middle"
                  className="fill-gray-600"
                  style={{ fontSize: 11 }}
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  // Vertical orientation
  const totalWidth = data.length * (barWidth + gap) + gap;
  const baselineY = chartHeight - 20;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${totalWidth} ${chartHeight}`}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const y = baselineY - f * (chartHeight - 40);
          return (
            <line
              key={f}
              x1={0}
              y1={y}
              x2={totalWidth}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
          );
        })}

        {data.map((d, i) => {
          const x = i * (barWidth + gap) + gap;
          const barH = (Math.abs(d.value) / max) * (chartHeight - 40);
          const isNegative = d.value < 0;
          const y = isNegative
            ? baselineY - (chartHeight - 40) / 2
            : baselineY - barH;

          return (
            <g key={d.label}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                fill={color}
                rx={4}
                className="transition-all duration-300 hover:opacity-80"
              />
              {showValues && (
                <text
                  x={x + barWidth / 2}
                  y={isNegative ? y - 6 : y - 6}
                  textAnchor="middle"
                  className="fill-gray-700"
                  style={{ fontSize: 12 }}
                >
                  {d.value.toLocaleString("fr-FR")}
                </text>
              )}
              <text
                x={x + barWidth / 2}
                y={baselineY + 16}
                textAnchor="middle"
                className="fill-gray-600"
                style={{ fontSize: 11 }}
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}