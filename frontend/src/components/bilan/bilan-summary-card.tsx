"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type BalanceSheetCategory } from "@/types/balance-sheet";
import { CATEGORY_LABELS } from "@/lib/constants/balance-sheet";

export interface BilanTotals {
  actif: number;
  passif: number;
  capitaux_propres: number;
  [key: string]: number;
}

export interface BilanSummaryCardProps {
  totals: BilanTotals;
  currency?: string;
  className?: string;
  showDetails?: boolean;
  detailTotals?: Record<BalanceSheetCategory, Record<string, number>>;
}

function formatAmount(amount: number, currency = "EUR"): string {
  const formatted = Math.abs(amount).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${currency}`;
}

function getBalanceStatus(assets: number, totalPassif: number): {
  isBalanced: boolean;
  difference: number;
  label: string;
  variant: "success" | "error" | "warning";
} {
  const difference = assets - totalPassif;
  const isBalanced = Math.abs(difference) < 0.01;

  if (isBalanced) {
    return {
      isBalanced: true,
      difference: 0,
      label: "Bilan équilibré",
      variant: "success",
    };
  }

  return {
    isBalanced: false,
    difference,
    label: difference > 0 ? "Actif > Passif" : "Passif > Actif",
    variant: "error",
  };
}

export function BilanSummaryCard({
  totals,
  currency = "EUR",
  className = "",
  showDetails = true,
  detailTotals,
}: BilanSummaryCardProps) {
  const assets = useMemo(() => (totals.actif as number) ?? 0, [totals]);
  const liabilities = useMemo(() => (totals.passif as number) ?? 0, [totals]);
  const equity = useMemo(() => (totals.capitaux_propres as number) ?? 0, [totals]);

  const netWorth = useMemo(() => assets - liabilities, [assets, liabilities]);
  const totalPassif = useMemo(() => liabilities + equity, [liabilities, equity]);

  const balanceStatus = useMemo(
    () => getBalanceStatus(assets, totalPassif),
    [assets, totalPassif]
  );

  const detailCategories = useMemo(() => {
    if (!detailTotals) return null;
    return (Object.keys(detailTotals) as BalanceSheetCategory[]).filter(
      (key) =>
        key !== "actif" &&
        key !== "passif" &&
        key !== "capitaux_propres"
    );
  }, [detailTotals]);

  return (
    <div className={`grid gap-4 lg:grid-cols-3 ${className}`}>
      {/* Actif Card */}
      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50 border-b border-blue-100">
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <span className="text-lg">📊</span>
            Actif
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center text-lg font-bold text-blue-800">
            <span>{CATEGORY_LABELS.actif}</span>
            <span>{formatAmount(assets, currency)}</span>
          </div>

          {showDetails && detailTotals?.actif && (
            <div className="space-y-2 border-t border-blue-100 pt-3">
              {Object.entries(detailTotals.actif).map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between text-sm text-gray-600"
                >
                  <span>{key}</span>
                  <span className="font-medium">{formatAmount(value, currency)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Passif Card */}
      <Card className="border-purple-200">
        <CardHeader className="bg-purple-50 border-b border-purple-100">
          <CardTitle className="text-purple-800 flex items-center gap-2">
            <span className="text-lg">📋</span>
            Passif
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center text-lg font-bold text-purple-800">
            <span>{CATEGORY_LABELS.passif}</span>
            <span>{formatAmount(liabilities, currency)}</span>
          </div>

          <div className="flex justify-between items-center text-lg font-medium text-gray-700">
            <span>{CATEGORY_LABELS.capitaux_propres}</span>
            <span>{formatAmount(equity, currency)}</span>
          </div>

          <div className="border-t border-purple-100 pt-3">
            <div className="flex justify-between items-center text-lg font-bold text-purple-800">
              <span>Total passif</span>
              <span>{formatAmount(totalPassif, currency)}</span>
            </div>
          </div>

          {showDetails && detailTotals?.passif && (
            <div className="space-y-2 border-t border-purple-100 pt-3">
              {Object.entries(detailTotals.passif).map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between text-sm text-gray-600"
                >
                  <span>{key}</span>
                  <span className="font-medium">{formatAmount(value, currency)}</span>
                </div>
              ))}
            </div>
          )}

          {showDetails && detailTotals?.capitaux_propres && (
            <div className="space-y-2 border-t border-purple-100 pt-3">
              {Object.entries(detailTotals.capitaux_propres).map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between text-sm text-gray-600"
                >
                  <span>{key}</span>
                  <span className="font-medium">{formatAmount(value, currency)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Net Worth / Balance Card */}
      <Card
        className={`border-2 ${
          balanceStatus.isBalanced ? "border-green-300" : "border-red-300"
        }`}
      >
        <CardHeader
          className={`${balanceStatus.isBalanced ? "bg-green-50" : "bg-red-50"} border-b ${
            balanceStatus.isBalanced ? "border-green-100" : "border-red-100"
          }`}
        >
          <CardTitle
            className={`${balanceStatus.isBalanced ? "text-green-800" : "text-red-800"} flex items-center gap-2`}
          >
            <span className="text-lg">
              {balanceStatus.isBalanced ? "✅" : "⚠️"}
            </span>
            Bilan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-gray-700">
              <span>Actif total</span>
              <span className="font-medium">{formatAmount(assets, currency)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Passif total</span>
              <span className="font-medium">{formatAmount(totalPassif, currency)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between text-lg font-bold">
                <span className={
                  netWorth >= 0 ? "text-green-700" : "text-red-700"
                }>
                  Résultat net
                </span>
                <span className={
                  netWorth >= 0 ? "text-green-700" : "text-red-700"
                }>
                  {formatAmount(netWorth, currency)}
                </span>
              </div>
            </div>
          </div>

          <div
            className={`px-4 py-3 rounded-lg text-center font-semibold ${
              balanceStatus.isBalanced
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span>
                {balanceStatus.isBalanced ? "✓" : "✗"}
              </span>
              <span>{balanceStatus.label}</span>
            </div>
            {!balanceStatus.isBalanced && balanceStatus.difference !== 0 && (
              <div className="mt-1 text-sm opacity-80">
                Écart : {formatAmount(Math.abs(balanceStatus.difference), currency)}
              </div>
            )}
          </div>

          {showDetails && (
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Détail par catégorie
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div
                  className={`p-2 rounded text-center ${
                    assets >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  }`}
                >
                  <div className="font-medium">Actif</div>
                  <div>{formatAmount(assets, currency)}</div>
                </div>
                <div
                  className={`p-2 rounded text-center ${
                    liabilities >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  }`}
                >
                  <div className="font-medium">Passif</div>
                  <div>{formatAmount(liabilities, currency)}</div>
                </div>
                <div
                  className={`p-2 rounded text-center ${
                    equity >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  }`}
                >
                  <div className="font-medium">Cap. propres</div>
                  <div>{formatAmount(equity, currency)}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export interface CompactBilanSummaryProps {
  totals: BilanTotals;
  currency?: string;
  className?: string;
}

export function CompactBilanSummary({
  totals,
  currency = "EUR",
  className = "",
}: CompactBilanSummaryProps) {
  const assets = (totals.actif as number) ?? 0;
  const liabilities = (totals.passif as number) ?? 0;
  const equity = (totals.capitaux_propres as number) ?? 0;
  const netWorth = assets - liabilities;
  const totalPassif = liabilities + equity;
  const isBalanced = Math.abs(assets - totalPassif) < 0.01;

  return (
    <Card className={`p-4 ${className}`}>
      <div className="grid grid-cols-4 gap-4 text-center">
        <div className="p-3 rounded-lg bg-blue-50">
          <div className="text-xs text-blue-600 uppercase tracking-wide">Actif</div>
          <div className="text-2xl font-bold text-blue-800">{formatAmount(assets, currency)}</div>
        </div>
        <div className="p-3 rounded-lg bg-purple-50">
          <div className="text-xs text-purple-600 uppercase tracking-wide">Passif</div>
          <div className="text-2xl font-bold text-purple-800">{formatAmount(liabilities, currency)}</div>
        </div>
        <div className="p-3 rounded-lg bg-indigo-50">
          <div className="text-xs text-indigo-600 uppercase tracking-wide">Cap. propres</div>
          <div className="text-2xl font-bold text-indigo-800">{formatAmount(equity, currency)}</div>
        </div>
        <div
          className={`p-3 rounded-lg ${
            isBalanced ? "bg-green-50" : "bg-red-50"
          }`}
        >
          <div className="text-xs text-gray-600 uppercase tracking-wide">
            Résultat net
          </div>
          <div
            className={`text-2xl font-bold ${
              netWorth >= 0 ? "text-green-700" : "text-red-700"
            }`}
          >
            {formatAmount(netWorth, currency)}
          </div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <Badge
          variant={isBalanced ? "success" : "error"}
          className="text-sm px-3 py-1"
        >
          {isBalanced ? "✓ Bilan équilibré" : "✗ Bilan déséquilibré"}
        </Badge>
      </div>
    </Card>
  );
}

export default BilanSummaryCard;