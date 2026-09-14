export interface Account {
  id: string;
  name: string;
  type: AccountType;
  accountNumber?: string;
  currency: string;
  balance: number;
  isActive: boolean;
  organizationId: string;
  parentId?: string;
  children?: Account[];
  createdAt: string;
  updatedAt: string;
}

export type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense";

export interface AccountCreate {
  name: string;
  type: AccountType;
  accountNumber?: string;
  currency?: string;
  parentId?: string;
}

export interface AccountBalance {
  accountId: string;
  accountName: string;
  balance: number;
  currency: string;
  debit: number;
  credit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
