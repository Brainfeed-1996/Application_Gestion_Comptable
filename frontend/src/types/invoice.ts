export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  date: string;
  dueDate: string;
  status: InvoiceStatus;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  currency: string;
  lines: InvoiceLine[];
  notes?: string;
  terms?: string;
  documentId?: string;
  sentAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceCreate {
  clientId: string;
  date: string;
  dueDate: string;
  currency: string;
  lines: InvoiceLineCreate[];
  notes?: string;
  terms?: string;
  discountTotal?: number;
}

export interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount?: number;
  total: number;
  taxAmount: number;
}

export interface InvoiceLineCreate {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount?: number;
}

export type InvoiceStatus = "draft" | "sent" | "viewed" | "partial" | "paid" | "overdue" | "void";
