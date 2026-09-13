export interface Account {
  id: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  currency: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
}
