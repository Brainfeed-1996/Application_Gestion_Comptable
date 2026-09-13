export interface ReportData {
  id?: string;
  name: string;
  period: string;
  startDate: string;
  endDate: string;
  totals: ReportTotal[];
  rows: ReportRow[];
}

export interface ReportTotal {
  label: string;
  value: number;
  currency: string;
}

export interface ReportRow {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface AgedReport {
  id?: string;
  name: string;
  period: string;
  date: string;
  categories: AgedCategory[];
  total: number;
}

export interface AgedCategory {
  name: string;
  range: string;
  amount: number;
  percentage: number;
  items: AgedItem[];
}

export interface AgedItem {
  id: string;
  name: string;
  reference: string;
  date: string;
  amount: number;
  ageDays: number;
}
