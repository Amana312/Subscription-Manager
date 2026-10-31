export type InvoiceStatus = 'DRAFT' | 'CONFIRMED' | 'PAID' | 'CANCELLED';
export type PaymentMethod = 'CARD' | 'BANK_TRANSFER' | 'UPI' | 'CASH' | 'CHEQUE';

export interface InvoiceLine {
  planId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
}

export interface Invoice {
  id: string;
  number: string;
  subscriptionId: string;
  subscriptionNumber: string;
  billingDate: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  lines: InvoiceLine[];
  subtotal: number;
  discountAmount: number;
  discountLabel?: string;
  taxTotal: number;
  total: number;
  amountPaid: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  customerId: string;
  method: PaymentMethod;
  amount: number;
  date: string;
  note: string;
  createdAt: string;
}

export interface BillableSubscription {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  nextBillingDate: string;
  lines: { planId: string; planName: string; quantity: number; unitPrice: number; lineTotal: number }[];
}