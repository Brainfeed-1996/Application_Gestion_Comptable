"use client";

import { useApiQuery, useApiMutation } from "./use-api";
import { reportsService } from "@/services/reports.service";
import { useQueryClient } from "@tanstack/react-query";
import type { ReportData, AgedReport } from "@/types/report";

export function useBalanceSheet(date?: string) {
  return useApiQuery<ReportData>(
    `balance-sheet-${date || "all"}`,
    () => reportsService.balanceSheet(date),
  );
}

export function useIncomeStatement(start: string, end: string) {
  return useApiQuery<ReportData>(
    `income-statement-${start}-${end}`,
    () => reportsService.incomeStatement(start, end),
  );
}

export function useTrialBalance(date?: string) {
  return useApiQuery<ReportData>(
    `trial-balance-${date || "all"}`,
    () => reportsService.trialBalance(date),
  );
}

export function useCashFlow(start: string, end: string) {
  return useApiQuery<ReportData>(
    `cash-flow-${start}-${end}`,
    () => reportsService.cashFlow(start, end),
  );
}

export function useAgedReceivables(date?: string) {
  return useApiQuery<AgedReport>(
    `aged-receivables-${date || "all"}`,
    () => reportsService.agedReceivables(date),
  );
}

export function useAgedPayables(date?: string) {
  return useApiQuery<AgedReport>(
    `aged-payables-${date || "all"}`,
    () => reportsService.agedPayables(date),
  );
}

export function useFecExport(start: string, end: string) {
  const queryClient = useQueryClient();
  return useApiMutation<Blob, { start: string; end: string }>(
    () => reportsService.fecExport(start, end),
    {
      onSuccess: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `fec-${start}-${end}.xml`;
        a.click();
        URL.revokeObjectURL(url);
        console.log("FEC exporté");
        queryClient.invalidateQueries({ queryKey: ["reports"] });
      },
    },
  );
}
