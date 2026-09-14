"use client";

import { useMemo } from "react";
import BarChart from "@/components/charts/bar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface BilanChartProps {
  actif: number;
  passif: number;
  currency?: string;
  className?: string;
}

export default function BilanChart({
  actif,
  passif,
  currency = "EUR",
  className = "",
}: BilanChartProps) {
  const data = useMemo(
    () => [
      { label: "Actif", value: actif },
      { label: "Passif", value: passif },
    ],
    [actif, passif]
  );

  const isBalanced = useMemo(() => Math.abs(actif - passif) < 0.01, [actif, passif]);
  const difference = useMemo(() => actif - passif, [actif, passif]);

  return (
    <div className={`w-full ${className}`}>
      <Card className="border-gray-200">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-gray-800 flex items-center justify-between">
            <span>Comparaison Actif / Passif</span>
            <Badge
              variant={isBalanced ? "success" : "destructive"}
              className={isBalanced ? "bg-green-100 text-green-700 border-green-300" : "bg-red-100 text-red-700 border-red-300"}
            >
              {isBalanced ? "✓ Équilibré" : `✗ Écart: ${Math.abs(difference).toLocaleString("fr-FR")} ${currency}`}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <BarChart
            data={data}
            height={350}
            showValues={true}
            color="#3b82f6"
            orientation="vertical"
          />
          <div
            className={`mt-4 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold ${
              isBalanced
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            <span>{isBalanced ? "✅" : "⚠️"}</span>
            <span>
              {isBalanced
                ? "Le bilan est équilibré"
                : `Déséquilibre de ${Math.abs(difference).toLocaleString("fr-FR")} ${currency}`}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
