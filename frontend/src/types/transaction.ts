export interface Transaction {
  id: string;
  accountId: string;
  accountName: string;
  categoryId?: string;
  categoryName?: string;
  counterparty?: string;
  reference?: string;
  label: string;
  description?: string;
  amount: number;
  currency: string;
  exchangeRate?: number;
  direction: "debit" | "credit";
  transactionDate: string;
  valueDate?: string;
  bookingDate: string;
  status: TransactionStatus;
  source: TransactionSource;
  externalId?: string;
  metadata?: Record<string, unknown>;
  createdBy?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionStatus = "pending" | "posted" | "reconciled" | "void";
export type TransactionSource = "manual" | "import" | "bank_feed" | "ocr";

export interface TransactionCreate {
  accountId: string;
  categoryId?: string;
  counterparty?: string;
  reference?: string;
  label: string;
  description?: string;
  amount: number;
  currency?: string;
  direction: "debit" | "credit";
  transactionDate: string;
  valueDate?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
