export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency_code: string;
}

export type AccountType = 'bank' | 'cash' | 'card' | 'payable' | 'receivable' | 'other';