export type TransactionType = 'income' | 'expense' | 'transfer' | 'adjustment';
export type TransactionStatus = 'draft' | 'posted' | 'reconciled' | 'void';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  reference: string;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  accountId: string;
  counterpartyId?: string;
  counterpartyName?: string;
  categoryId?: string;
  taxRate?: number;
  taxAmount?: number;
  netAmount?: number;
  isReconciled: boolean;
  notes?: string;
  documentId?: string;
  createdAt: string;
  updatedAt: string;
  lines?: TransactionLine[];
}

export interface TransactionCreate {
  date: string;
  description: string;
  reference: string;
  amount: number;
  currency: string;
  type: TransactionType;
  accountId: string;
  counterpartyId?: string;
  counterpartyName?: string;
  categoryId?: string;
  taxRate?: number;
  notes?: string;
  lines?: TransactionLineCreate[];
}

export interface TransactionLine {
  id: string;
  transactionId: string;
  description: string;
  debit: number;
  credit: number;
  accountId: string;
  accountName: string;
}

export interface TransactionLineCreate {
  description: string;
  debit?: number;
  credit?: number;
  accountId: string;
}

export interface ImportResult {
  imported: number;
  errors: number;
  errorMessages: string[];
}

export interface ReconciliationResult {
  reconciled: number;
  errors: string[];
}
