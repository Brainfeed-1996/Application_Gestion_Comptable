"use client";

import { useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Scale,
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

export interface BalanceSheetMiniProps {
  draftId?: string;
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

function MiniSkeleton() {
  return (
    <div className="space-y-3" aria-label="Chargement du bilan">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="h-9 animate-pulse rounded-md bg-gray-100" />
      ))}
    </div>
  );
}

export function BalanceSheetMini({
  draftId,
  currency = "EUR",
  className,
}: BalanceSheetMiniProps) {
  const { data, isLoading, isFetching, error } =
    useBalanceSheetCalculation(draftId);
  const colors = useMemo(() => getChartColors(3), []);

  const sheet = useMemo(() => {
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
    : sheet.isBalanced
      ? "balanced"
      : sheet.difference > 0
        ? "high"
        : "low";

  const statusContent = {
    pending: {
      label: "En attente",
      classes: "bg-gray-100 text-gray-700",
      dotClasses: "bg-gray-500",
      icon: <Clock3 className="h-4 w-4" aria-hidden="true" />,
    },
    balanced: {
      label: "Équilibré",
      classes: "bg-emerald-50 text-emerald-700",
      dotClasses: "bg-emerald-500",
      icon: <CheckCircle2 className="h-4 w-4" aria-hidden="true" />,
    },
    high: {
      label: "Actif supérieur",
      classes: "bg-amber-50 text-amber-700",
      dotClasses: "bg-amber-500",
      icon: <AlertTriangle className="h-4 w-4" aria-hidden="true" />,
    },
    low: {
      label: "Passif supérieur",
      classes: "bg-red-50 text-red-700",
      dotClasses: "bg-red-500",
      icon: <AlertTriangle className="h-4 w-4" aria-hidden="true" />,
    },
  }[status];

  const rows = [
    {
      label: "Actif total",
      value: sheet.assets,
      color: colors[0],
      share: 100,
    },
    {
      label: "Passif total",
      value: sheet.liabilities,
      color: colors[1],
      share:
        sheet.totalPassif > 0
          ? calculatePercentage(sheet.liabilities, sheet.totalPassif)
          : 0,
    },
    {
      label: "Capitaux propres",
      value: sheet.equity,
      color: colors[2],
      share:
        sheet.totalPassif > 0
          ? calculatePercentage(sheet.equity, sheet.totalPassif)
          : 0,
    },
  ];

  return (
    <Card
      className={cn("relative overflow-hidden", className)}
      aria-busy={isLoading || isFetching || undefined}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />

      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <Scale className="h-4.5 w-4.5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Balance sheet
              </p>
              <h3 className="text-base font-semibold tracking-tight">
                Synthèse compacte
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

        <div
          className={cn(
            "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            statusContent.classes,
          )}
        >
          <span
            className={cn("h-1.5 w-1.5 rounded-full", statusContent.dotClasses)}
            aria-hidden="true"
          />
          {statusContent.icon}
          {statusContent.label}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {isLoading ? (
          <MiniSkeleton />
        ) : error || !data ? (
          <div
            role="alert"
            className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-5 text-center"
          >
            <Scale className="mx-auto h-6 w-6 text-gray-400" aria-hidden="true" />
            <p className="mt-2 text-sm font-medium text-gray-700">
              {error
                ? "Impossible de charger le bilan."
                : "Aucun total disponible."}
            </p>
            {error && (
              <p className="mt-1 text-xs text-gray-500">{error.message}</p>
            )}
          </div>
        ) : (
          <>
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-medium text-muted-foreground">
                  <th className="pb-2 font-medium">Poste</th>
                  <th className="pb-2 text-right font-medium">Montant</th>
                  <th className="pb-2 text-right font-medium">Répartition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => (
                  <tr key={row.label} className="align-middle">
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: row.color }}
                          aria-hidden="true"
                        />
                        <span className="font-medium text-gray-800">
                          {row.label}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 text-right font-semibold tabular-nums text-gray-950">
                      {formatCurrency(row.value, currency)}
                    </td>
                    <td className="py-2.5 text-right tabular-nums text-muted-foreground">
                      {formatPercentage(row.share)}
                    </td>
                  </tr>
                ))}
                <tr className="align-middle">
                  <td className="py-2.5 pr-3 font-medium text-gray-800">
                    Résultat
                  </td>
                  <td
                    className={cn(
                      "py-2.5 text-right font-bold tabular-nums",
                      sheet.result < 0 ? "text-red-700" : "text-emerald-700",
                    )}
                  >
                    {formatCurrency(sheet.result, currency)}
                  </td>
                  <td className="py-2.5 text-right text-xs text-muted-foreground">
                    actif − passif
                  </td>
                </tr>
              </tbody>
            </table>

            <div>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-medium text-gray-700">Couverture du passif</span>
                <span className="font-semibold tabular-nums text-gray-900">
                  {formatPercentage(sheet.progress)}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    status === "balanced"
                      ? "bg-emerald-500"
                      : status === "high"
                        ? "bg-amber-500"
                        : "bg-red-500",
                  )}
                  style={{ width: `${sheet.progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3 text-xs text-muted-foreground">
              <span>Écart de situation</span>
              <span className="font-semibold tabular-nums text-gray-800">
                {formatCurrency(Math.abs(sheet.difference), currency)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                Calculé le{" "}
                <time dateTime={data.calculatedAt}>
                  {formatTimestamp(data.calculatedAt)}
                </time>
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default BalanceSheetMini;
