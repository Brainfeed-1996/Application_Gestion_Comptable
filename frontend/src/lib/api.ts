import { z } from 'zod';
import axios from 'axios';
import type { UserLogin, UserRegister } from '@/types/user';
import type { TransactionCreate } from '@/types/transaction';
import type { InvoiceCreate } from '@/types/invoice';
import type { AccountCreate } from '@/types/account';
import { API_BASE_URL } from './constants';
import { clearTokens } from './auth';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export const transactionSchema = z.object({
  account_id: z.string().uuid(),
  label: z.string(),
  amount: z.number(),
});

export const invoiceSchema = z.object({
  customer_name: z.string(),
  issue_date: z.string(),
  due_date: z.string(),
  lines: z.array(z.any()),
});

export const accountSchema = z.object({
  name: z.string(),
  type: z.string(),
});

export const passwordSchema = z.object({
  current_password: z.string(),
  new_password: z.string(),
  confirm_password: z.string(),
});

export function validateLogin(data: UserLogin): z.ZodError | null {
  const result = loginSchema.safeParse(data);
  return result.success ? null : result.error;
}

export function validateRegister(data: UserRegister): z.ZodError | null {
  const result = registerSchema.safeParse(data);
  return result.success ? null : result.error;
}

export function validateTransaction(data: TransactionCreate): z.ZodError | null {
  const result = transactionSchema.safeParse(data);
  return result.success ? null : result.error;
}

export function validateInvoice(data: InvoiceCreate): z.ZodError | null {
  const result = invoiceSchema.safeParse(data);
  return result.success ? null : result.error;
}

export function validateAccount(data: AccountCreate): z.ZodError | null {
  const result = accountSchema.safeParse(data);
  return result.success ? null : result.error;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export function handleApiError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.error?.message
      || error.response?.data?.message
      || error.message;
    return new Error(message);
  }
  if (error instanceof Error) {
    return error;
  }
  return new Error(String(error));
}

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        clearTokens();
        window.location.href = '/login';
      }
    }
    return Promise.reject(handleApiError(error));
  },
);

export default apiClient;
