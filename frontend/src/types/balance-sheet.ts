export interface BalanceSheetTemplate {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  business_type: string;
  is_default: boolean;
  is_active: boolean;
  structure: Record<string, unknown>;
}

export interface BalanceSheetDraft {
  id: string;
  organization_id: string;
  template_id: string | null;
  name: string;
  fiscal_year: number;
  status: BalanceSheetStatus;
  data: BalanceSheetItem[];
  calculated_totals: BilanTotals | null;
}

export interface BalanceSheetItem {
  draft_id: string;
  category: BilanCategory;
  account_code: string;
  account_name: string;
  amount: number;
  is_calculated: boolean;
}

export type BilanCategory = 'actif' | 'passif' | 'capitaux_propres';

export interface BilanTotals {
  actif: number;
  passif: number;
  capitaux_propres: number;
  net_worth: number;
  balanced: boolean;
}

export type BalanceSheetStatus = 'draft' | 'finalized' | 'cancelled';