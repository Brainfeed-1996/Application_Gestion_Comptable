import { apiClient } from '@/lib/api';
import type { BilanData, CRData, TVAReport, FECEntry } from '@/types/tax';

export async function getBilan(date?: string): Promise<BilanData> {
  const query = date ? `?date=${date}` : '';
  return apiClient.get<BilanData>(`/reports/bilan${query}`).then(r => r.data);
}

export async function getCompteRendu(period?: string): Promise<CRData> {
  const query = period ? `?period=${period}` : '';
  return apiClient.get<CRData>(`/reports/compte-rendu${query}`).then(r => r.data);
}

export async function getTVAReport(period?: string): Promise<TVAReport> {
  const query = period ? `?period=${period}` : '';
  return apiClient.get<TVAReport>(`/reports/tva${query}`).then(r => r.data);
}

export async function getFECReport(dateFrom: string, dateTo: string): Promise<FECEntry[]> {
  const query = `?dateFrom=${dateFrom}&dateTo=${dateTo}`;
  return apiClient.get<FECEntry[]>(`/reports/fec${query}`).then(r => r.data);
}

export async function exportReport(format: 'pdf' | 'csv' | 'xlsx', reportType: string): Promise<void> {
  const url = `/reports/export?format=${format}&type=${reportType}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
  });
  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = `${reportType}.${format}`;
  a.click();
  window.URL.revokeObjectURL(blobUrl);
}

export async function exportFEC(dateFrom: string, dateTo: string): Promise<void> {
  const url = `/reports/fec/export?dateFrom=${dateFrom}&dateTo=${dateTo}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
  });
  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = `fec_${dateFrom}_${dateTo}.csv`;
  a.click();
  window.URL.revokeObjectURL(blobUrl);
}
