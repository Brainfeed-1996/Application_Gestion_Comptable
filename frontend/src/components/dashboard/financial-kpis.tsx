"use client";

import { useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { useBalanceSheetCalculation } from "@/hooks/use-balance-sheet";
import { cn } from "@/lib/utils";
import {
  calculatePercentage,
  formatCurrency,
  formatPercentage,
  getChartColors,
} from "@/lib/utils/charts";

const BALANCE_TOLERANCE = 0.01;
const LIQUIDITY_TARGET = 1;
const SOLVENCY_TARGET = 0.2;

export interface FinancialRatios {
  liquidity?: number;
  solvency?: number;
}

export interface FinancialKpisProps {
  draftId?: string;
  previousRatios?: FinancialRatios;
  currency?: string;
  className?: string;
}

interface Trend {
  direction: "up" | "down" | "flat";
  delta: number;
  hasPrevious: boolean;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function getRatio(
  ratios: Record<string, number> | undefined,
  keys: readonly string[],
): number | undefined {
  for (const key of keys) {
    const value = ratios?.[key];
    if (isFiniteNumber(value)) return value;
  }
  return undefined;
}

function getTrend(
  current: number | undefined,
  previous: number | undefined,
): Trend | undefined {
  if (!isFiniteNumber(current) || !isFiniteNumber(previous)) return undefined;

  const delta = current - previous;
  if (Math.abs(delta) < 0.005) {
    return { direction: "flat", delta, hasPrevious: true };
  }

  return {
    direction: delta > 0 ? "up" : "down",
    delta,
    hasPrevious: true,
  };
}

function getBenchmarkTrend(current: number | undefined, target: number): Trend | undefined {
  if (!isFiniteNumber(current)) return undefined;

  const delta = current - target;
  if (Math.abs(delta) < 0.005) {
    return { direction: "flat", delta, hasPrevious: false };
  }

  return {
    direction: delta > 0 ? "up" : "down",
    delta,
    hasPrevious: false,
  };
}

function formatTimestamp(value: string | undefined): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function TrendIndicator({
  trend,
  isPercentage = false,
}: {
  trend?: Trend;
  isPercentage?: boolean;
}) {
  if (!trend) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100">
          <span className="h-2.5 w-px bg-gray-400" aria-hidden="true" />
        </span>
        <span>—</span>
      </span>
    );
  }

  const delta = isPercentage ? trend.delta * 100 : trend.delta;
  const directionClasses =
    trend.direction === "up"
      ? "bg-emerald-50 text-emerald-700"
      : trend.direction === "down"
        ? "bg-red-50 text-red-700"
        : "bg-gray-100 text-gray-600";
  const Icon =
    trend.direction === "up"
      ? TrendingUp
      : trend.direction === "down"
        ? TrendingDown
        : null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
        directionClasses,
      )}
      aria-label={
        trend.direction === "up"
          ? "Tendance à la hausse"
          : trend.direction === "down"
            ? "Tendance à la baisse"
            : "Tendance stable"
      }
    >
      {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : <span aria-hidden="true">=</span>}
      {delta > 0 ? "+" : ""}
      {Math.abs(delta).toFixed(isPercentage ? 1 : 2)}
    </span>
  );
}

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Chargement des indicateurs">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-32 animate-pulse rounded-lg bg-gray-100" />
      ))}
    </div>
  );
}

export function FinancialKpis({
  draftId,
  previousRatios,
  currency = "EUR",
  className,
}: FinancialKpisProps) {
  const { data, isLoading, isFetching, error } =
    useBalanceSheetCalculation(draftId);
  const colors = useMemo(() => getChartColors(3), []);

  const kpis = useMemo(() => {
    const assets = data?.assets ?? 0;
    const liabilities = data?.liabilities ?? 0;
    const equity = data?.equity ?? 0;
    const totalPassif = liabilities + equity;
    const result = assets - liabilities;
    const difference = assets - totalPassif;
    const isBalanced = Math.abs(difference) < BALANCE_TOLERANCE;
    const progress =
      totalPassif === 0
        ? assets === 0
          ? 100
          : 0
        : Math.min(100, Math.max(0, calculatePercentage(assets, totalPassif)));

    const currentRatio = getRatio(data?.ratios, [
      "current_ratio",
      "liquidity_ratio",
      "liquidity",
      "quick_ratio",
    ]);
    const debtToEquity = getRatio(data?.ratios, ["debt_to_equity"]);
    const explicitSolvency = getRatio(data?.ratios, [
      "solvency_ratio",
      "solvency",
      "equity_ratio",
    ]);
    const debtSolvency =
      isFiniteNumber(debtToEquity) && debtToEquity > -1
        ? 1 / (1 + debtToEquity)
        : undefined;
    const calculatedSolvency =
      assets > 0 ? calculatePercentage(equity, assets) / 100 : undefined;
    const liquidity =
      currentRatio ?? (liabilities > 0 ? assets / liabilities : undefined);
    const solvency = explicitSolvency ?? debtSolvency ?? calculatedSolvency;
    const previousLiquidity =
      previousRatios?.liquidity ??
      getRatio(data?.ratios, [
        "previous_current_ratio",
        "previous_liquidity",
        "liquidity_previous",
      ]);
    const previousSolvency =
      previousRatios?.solvency ??
      getRatio(data?.ratios, [
        "previous_solvency_ratio",
        "previous_solvency",
        "solvency_previous",
      ]);
    const liquidityTrend =
      getTrend(liquidity, previousLiquidity) ??
      getBenchmarkTrend(liquidity, LIQUIDITY_TARGET);
    const solvencyTrend =
      getTrend(solvency, previousSolvency) ??
      getBenchmarkTrend(solvency, SOLVENCY_TARGET);

    return {
      assets,
      liabilities,
      equity,
      result,
      progress,
      isBalanced,
      liquidity,
      solvency,
      liquidityTrend,
      solvencyTrend,
    };
  }, [data, previousRatios]);

  const hasData = Boolean(data);

  return (
    <Card
      className={cn("relative overflow-hidden", className)}
      aria-busy={isLoading || isFetching || undefined}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500" />

      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <Activity className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Performance
              </p>
              <h3 className="text-lg font-semibold tracking-tight">
                Indicateurs financiers
              </h3>
            </div>
          </div>

          {isFetching && (
            <RefreshCw
              className="h-4 w-4 animate-spin text-blue-600"
              aria-label="Actualisation en cours"
            />
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
          <span>
            Dernière mise à jour :{" "}
            <time dateTime={data?.calculatedAt}>
              {formatTimestamp(data?.calculatedAt)}
            </time>
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {isLoading ? (
          <KpiSkeleton />
        ) : error || !data ? (
          <div
            role="alert"
            className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-5 text-center"
          >
            <Activity className="mx-auto h-7 w-7 text-gray-400" aria-hidden="true" />
            <p className="mt-2 text-sm font-medium text-gray-700">
              {error
                ? "Impossible de charger les indicateurs."
                : "Aucune donnée financière disponible."}
            </p>
            {error && (
              <p className="mt-1 text-xs text-gray-500">{error.message}</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-md text-white"
                  style={{ backgroundColor: colors[0] }}
                >
                  <Activity className="h-4 w-4" aria-hidden="true" />
                </span>
                <TrendIndicator trend={kpis.liquidityTrend} />
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Liquidité
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-gray-950">
                  {kpis.liquidity === undefined
                    ? "—"
                    : `${kpis.liquidity.toFixed(2)} x`}
                </p>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Actif / passif exigible
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, (kpis.liquidity ?? 0) / 2 * 100),
                    )}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {kpis.liquidityTrend?.hasPrevious
                  ? "Évolution vs période précédente"
                  : `Position vs cible ${LIQUIDITY_TARGET.toFixed(1)} x`}
              </p>
            </div>

            <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-md text-white"
                  style={{ backgroundColor: colors[1] }}
                >
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                </span>
                <TrendIndicator trend={kpis.solvencyTrend} isPercentage />
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Solvabilité
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-gray-950">
                  {kpis.solvency === undefined
                    ? "—"
                    : formatPercentage(kpis.solvency * 100)}
                </p>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Capitaux propres / actif total
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, (kpis.solvency ?? 0) * 100))}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {kpis.solvencyTrend?.hasPrevious
                  ? "Évolution vs période précédente"
                  : `Position vs cible ${formatPercentage(SOLVENCY_TARGET * 100)}`}
              </p>
            </div>

            <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-md text-white",
                    kpis.isBalanced ? "bg-emerald-500" : "bg-amber-500",
                  )}
                >
                  {kpis.isBalanced ? (
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  )}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                    kpis.result < 0
                      ? "bg-red-50 text-red-700"
                      : kpis.result > 0
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-600",
                  )}
                >
                  {kpis.result < 0 ? (
                    <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : kpis.result > 0 ? (
                    <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <span className="h-2.5 w-px bg-current" aria-hidden="true" />
                  )}
                  {kpis.result < 0
                    ? "Déficit"
                    : kpis.result > 0
                      ? "Excédent"
                      : "Équilibre"}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Résultat
                </p>
                <p
                  className={cn(
                    "mt-1 text-2xl font-bold tracking-tight",
                    kpis.result < 0 ? "text-red-700" : "text-gray-950",
                  )}
                >
                  {formatCurrency(kpis.result, currency)}
                </p>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Actif moins passif · couverture{" "}
                {formatPercentage(kpis.progress)}
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    kpis.isBalanced ? "bg-emerald-500" : "bg-amber-500",
                  )}
                  style={{ width: `${kpis.progress}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {kpis.isBalanced
                  ? "Bilan équilibré"
                  : "Écart à régulariser"}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default FinancialKpis;
