export interface Transaction {
  id: string;
  date: string;
  label: string;
  amount: number;
  type: TransactionType;
  category: string;
  account_id: string;
}

export interface TransactionCreate {
  date: string;
  label: string;
  amount: number;
  type: TransactionType;
  category: string;
  account_id: string;
}

export type TransactionType = 'debit' | 'credit';