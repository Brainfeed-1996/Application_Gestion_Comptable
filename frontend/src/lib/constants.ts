export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL as string) || 'http://localhost:3001/api';

export const ROUTES = {
  dashboard: '/dashboard',
  transactions: '/transactions',
  invoices: '/invoices',
  clients: '/clients',
  reports: '/reports',
  settings: '/settings',
  login: '/login',
} as const;

export const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  CHF: 'Fr',
  JPY: '¥',
};

export const DATE_FORMATS = {
  FULL: 'MMMM yyyy',
  SHORT: 'dd/MM/yyyy',
  MEDIUM: 'dd MMMM yyyy',
  TIME: 'HH:mm',
  DATETIME: 'dd/MM/yyyy HH:mm',
} as const;

export const PAGE_SIZE = 20;
