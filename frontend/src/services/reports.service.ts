import { apiClient } from "@/lib/api";
import type { ReportData, AgedReport } from "@/types/report";

export async function getBilan(date?: string): Promise<ReportData> {
  const query = date ? `?date=${date}` : "";
  return {} as ReportData;
}

export async function getCompteRendu(period?: string): Promise<ReportData> {
  return {} as ReportData;
}

export async function getTVAReport(period?: string): Promise<unknown> {
  return {};
}

export async function getFECReport(dateFrom: string, dateTo: string): Promise<unknown[]> {
  return [];
}

export async function exportReport(format: "pdf" | "csv" | "xlsx", reportType: string): Promise<void> {
  const url = `/reports/export?format=${format}&type=${reportType}`;
  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
  });
  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = `${reportType}.${format}`;
  a.click();
  window.URL.revokeObjectURL(blobUrl);
}

export async function exportFEC(dateFrom: string, dateTo: string): Promise<void> {
  const url = `/reports/fec/export?dateFrom=${dateFrom}&dateTo=${dateTo}`;
  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
  });
  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = `fec_${dateFrom}_${dateTo}.csv`;
  a.click();
  window.URL.revokeObjectURL(blobUrl);
}

export const reportsService = {
  async balanceSheet(date?: string): Promise<ReportData> {
    return getCompteRendu(date) as unknown as Promise<ReportData>;
  },
  async incomeStatement(start?: string, end?: string): Promise<ReportData> {
    return getCompteRendu(`${start}-${end}`) as unknown as Promise<ReportData>;
  },
  async trialBalance(date?: string): Promise<ReportData> {
    return getCompteRendu(date) as unknown as Promise<ReportData>;
  },
  async cashFlow(start?: string, end?: string): Promise<ReportData> {
    return getBilan() as unknown as Promise<ReportData>;
  },
  async agedReceivables(date?: string): Promise<AgedReport> {
    return { id: "", name: "Aged Receivables", period: date || "", date: date || "", categories: [], total: 0 };
  },
  async agedPayables(date?: string): Promise<AgedReport> {
    return { id: "", name: "Aged Payables", period: date || "", date: date || "", categories: [], total: 0 };
  },
  async fecExport(start: string, end: string): Promise<Blob> {
    await exportFEC(start, end);
    return new Blob();
  },
};
