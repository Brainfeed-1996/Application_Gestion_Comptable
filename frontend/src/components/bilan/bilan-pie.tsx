"use client";

import PieChart from "@/components/charts/pie-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface BilanPieProps {
  actif: number;
  passif: number;
  currency?: string;
  className?: string;
}

export default function BilanPie({
  actif,
  passif,
  currency = "EUR",
  className = "",
}: BilanPieProps) {
  const data = [
    { label: "Actif", value: Math.max(actif, 0) },
    { label: "Passif", value: Math.max(passif, 0) },
  ];

  const isBalanced = Math.abs(actif - passif) < 0.01;

  return (
    <div className={`w-full ${className}`}>
      <Card className="border-gray-200">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-gray-800 flex items-center justify-between">
            <span>Répartition Actif / Passif</span>
            <Badge
              variant={isBalanced ? "success" : "destructive"}
              className={isBalanced ? "bg-green-100 text-green-700 border-green-300" : "bg-red-100 text-red-700 border-red-300"}
            >
              {isBalanced ? "✓ Équilibré" : "✗ Déséquilibré"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <PieChart
            data={data}
            height={320}
            showLabels={true}
            showPercent={true}
            innerRadius={0}
          />
          <div className="mt-2 grid grid-cols-2 gap-4 text-center">
            <div className="rounded-lg bg-blue-50 p-3">
              <div className="text-xs text-blue-600 uppercase tracking-wide">Actif</div>
              <div className="text-lg font-bold text-blue-800">
                {actif.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
              </div>
            </div>
            <div className="rounded-lg bg-purple-50 p-3">
              <div className="text-xs text-purple-600 uppercase tracking-wide">Passif</div>
              <div className="text-lg font-bold text-purple-800">
                {passif.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
