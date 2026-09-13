export interface Tax {
  id: string;
  name: string;
  code: string;
  rate: number;
  type: TaxType;
  isActive: boolean;
  country: string;
  region?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaxType = 'vat' | 'gst' | 'sales_tax' | 'income_tax' | 'withholding' | 'other';

export interface TaxRate {
  id: string;
  name: string;
  rate: number;
  type: TaxType;
}

export interface VATReport {
  period: string;
  startDate: string;
  endDate: string;
  vatCollected: number;
  vatPaid: number;
  vatDue: number;
  vatRefunded: number;
  lines: VATReportLine[];
}

export interface VATReportLine {
  taxRateId: string;
  taxRateName: string;
  taxRate: number;
  taxableAmount: number;
  taxAmount: number;
}
