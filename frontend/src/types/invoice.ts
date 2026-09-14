export interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  status: InvoiceStatus;
  total: number;
  issue_date: string;
  due_date: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';