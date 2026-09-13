import { apiService } from './api';
import type { Account, AccountCreate, AccountBalance, PaginatedResponse } from '@/types/account';

export type AccountParams = {
  page?: number;
  pageSize?: number;
  type?: string;
  search?: string;
};

export const accountsService = {
  async list(params: AccountParams): Promise<PaginatedResponse<Account>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.pageSize) query.set('pageSize', String(params.pageSize));
    if (params.type) query.set('type', params.type);
    if (params.search) query.set('search', params.search);
    const qs = query.toString();
    return apiService.get(`/accounts${qs ? `?${qs}` : ''}`);
  },

  async get(id: string): Promise<Account> {
    return apiService.get(`/accounts/${id}`);
  },

  async create(data: AccountCreate): Promise<Account> {
    return apiService.post('/accounts', data);
  },

  async update(id: string, data: Partial<AccountCreate>): Promise<Account> {
    return apiService.patch(`/accounts/${id}`, data);
  },

  async remove(id: string): Promise<void> {
    return apiService.delete(`/accounts/${id}`);
  },

  async getBalance(id: string): Promise<AccountBalance> {
    return apiService.get(`/accounts/${id}/balance`);
  },
};
