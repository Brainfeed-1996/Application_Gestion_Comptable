"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Landmark,
  RefreshCw,
  Scale,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
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

export interface BilanSummaryProps {
  draftId?: string;
  bilanHref?: string;
  currency?: string;
  className?: string;
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

function SummarySkeleton() {
  return (
    <div className="space-y-4" aria-label="Chargement du bilan">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-20 animate-pulse rounded-lg bg-gray-100"
          />
        ))}
      </div>
      <div className="h-16 animate-pulse rounded-lg bg-gray-100" />
    </div>
  );
}

export function BilanSummary({
  draftId,
  bilanHref = "/bilan",
  currency = "EUR",
  className,
}: BilanSummaryProps) {
  const { data, isLoading, isFetching, error } =
    useBalanceSheetCalculation(draftId);
  const colors = useMemo(() => getChartColors(3), []);

  const summary = useMemo(() => {
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

    return {
      assets,
      liabilities,
      equity,
      totalPassif,
      result,
      difference,
      isBalanced,
      progress,
    };
  }, [data]);

  const hasData = Boolean(data);
  const status = !hasData
    ? "pending"
    : summary.isBalanced
      ? "balanced"
      : summary.difference > 0
        ? "high"
        : "low";

  const statusContent = {
    pending: {
      label: "En attente",
      classes: "bg-gray-100 text-gray-700",
      dotClasses: "bg-gray-500",
      icon: <Clock3 className="h-3.5 w-3.5" />,
    },
    balanced: {
      label: "Bilan équilibré",
      classes: "bg-emerald-50 text-emerald-700",
      dotClasses: "bg-emerald-500",
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    },
    high: {
      label: "Actif supérieur",
      classes: "bg-amber-50 text-amber-700",
      dotClasses: "bg-amber-500",
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
    },
    low: {
      label: "Passif supérieur",
      classes: "bg-red-50 text-red-700",
      dotClasses: "bg-red-500",
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
    },
  }[status];

  const resultClasses =
    summary.result > 0
      ? "text-emerald-700"
      : summary.result < 0
        ? "text-red-700"
        : "text-gray-900";

  return (
    <Card
      className={cn("relative overflow-hidden", className)}
      aria-busy={isLoading || isFetching || undefined}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500" />

      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Landmark className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Bilan
              </p>
              <h3 className="text-lg font-semibold tracking-tight">
                Synthèse du bilan
              </h3>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {isFetching && (
              <RefreshCw
                className="h-4 w-4 animate-spin text-blue-600"
                aria-label="Actualisation en cours"
              />
            )}
            <Badge
              variant={
                status === "balanced"
                  ? "success"
                  : status === "pending"
                    ? "secondary"
                    : status === "high"
                      ? "warning"
                      : "error"
              }
              className="gap-1.5"
            >
              <span
                className={cn("h-1.5 w-1.5 rounded-full", statusContent.dotClasses)}
                aria-hidden="true"
              />
              {statusContent.label}
            </Badge>
          </div>
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
          <SummarySkeleton />
        ) : error || !data ? (
          <div
            role="alert"
            className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-5 text-center"
          >
            <Landmark className="mx-auto h-7 w-7 text-gray-400" aria-hidden="true" />
            <p className="mt-2 text-sm font-medium text-gray-700">
              {error
                ? "Impossible de charger le bilan."
                : "Aucun bilan calculé pour le moment."}
            </p>
            {error && (
              <p className="mt-1 text-xs text-gray-500">{error.message}</p>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total actif
                  </p>
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-md text-white"
                    style={{ backgroundColor: colors[0] }}
                  >
                    <WalletCards className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-3 text-xl font-bold tracking-tight text-gray-950">
                  {formatCurrency(summary.assets, currency)}
                </p>
              </div>

              <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total passif
                  </p>
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-md text-white"
                    style={{ backgroundColor: colors[1] }}
                  >
                    <Landmark className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-3 text-xl font-bold tracking-tight text-gray-950">
                  {formatCurrency(summary.liabilities, currency)}
                </p>
              </div>

              <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    Résultat
                  </p>
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-md text-white",
                      summary.result < 0 ? "bg-red-500" : "bg-emerald-500",
                    )}
                  >
                    <Scale className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
                <p
                  className={cn(
                    "mt-3 text-xl font-bold tracking-tight",
                    resultClasses,
                  )}
                >
                  {formatCurrency(summary.result, currency)}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    État d'équilibre
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Actif comparé au passif et aux capitaux propres
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold text-gray-800">
                  {formatPercentage(summary.progress)}
                </span>
              </div>

              <div
                className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(summary.progress)}
                aria-valuetext={`${summary.progress.toFixed(1)} %, ${statusContent.label}`}
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    status === "balanced"
                      ? "bg-emerald-500"
                      : status === "high"
                        ? "bg-amber-500"
                        : "bg-red-500",
                  )}
                  style={{ width: `${summary.progress}%` }}
                />
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                {summary.isBalanced
                  ? "Les totaux sont concordants."
                  : `Écart de ${formatCurrency(
                      Math.abs(summary.difference),
                      currency,
                    )} à régulariser.`}
              </p>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="border-t border-gray-100 bg-gray-50/70 px-6 py-4">
        <Link
          href={bilanHref}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition-colors hover:text-blue-800"
        >
          Voir le bilan complet
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </CardFooter>
    </Card>
  );
}

export default BilanSummary;
