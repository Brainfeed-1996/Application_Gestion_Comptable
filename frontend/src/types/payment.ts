export interface Payment {
  id: string;
  invoice_id: string;
  invoice_number?: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  payment_date: string;
  reference?: string;
  notes?: string;
  created_at?: string;
}

export interface PaymentCreate {
  invoice_id: string;
  amount: number;
  method: PaymentMethod;
  payment_date: string;
  reference?: string;
  notes?: string;
}

export type PaymentMethod = "cash" | "card" | "transfer" | "check";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";