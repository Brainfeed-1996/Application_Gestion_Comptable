import { loginSchema, registerSchema, transactionSchema, invoiceSchema, accountSchema, passwordSchema } from './validators';
import type { UserLogin, UserRegister } from '@/types/user';
import type { TransactionCreate } from '@/types/transaction';
import type { InvoiceCreate } from '@/types/invoice';
import type { AccountCreate } from '@/types/account';

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type AccountInput = z.infer<typeof accountSchema>;
export type PasswordInput = z.infer<typeof passwordSchema>;

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
