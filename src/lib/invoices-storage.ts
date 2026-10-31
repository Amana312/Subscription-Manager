import fs from 'fs';
import path from 'path';
import {
  Invoice, InvoiceLine, Payment, PaymentMethod, BillableSubscription,
} from './invoices-types';

const DATA_DIR = path.join(process.cwd(), '.data');
const INVOICES_FILE = path.join(DATA_DIR, 'invoices.json');
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json');

export const DEFAULT_TAX_RATE = 0.18; // replace with admin tax rules later
const PAYMENT_TERMS_DAYS = 15;

function readJson<T>(file: string): T[] {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(file)) fs.writeFileSync(file, '[]', 'utf-8');
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as T[];
  } catch {
    return [];
  }
}
function writeJson<T>(file: string, data: T[]) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function getAllInvoices(): Invoice[] {
  return readJson<Invoice>(INVOICES_FILE);
}
export function getInvoiceById(id: string): Invoice | undefined {
  return getAllInvoices().find((i) => i.id === id);
}
export function getAllPayments(): Payment[] {
  return readJson<Payment>(PAYMENTS_FILE);
}
export function getPaymentsForInvoice(invoiceId: string): Payment[] {
  return getAllPayments().filter((p) => p.invoiceId === invoiceId);
}

export function isOverdue(inv: Invoice, now = new Date()): boolean {
  return inv.status === 'CONFIRMED' && new Date(inv.dueDate) < now;
}

// Create an invoice from a subscription. Never bills the same cycle twice.
export function createInvoiceFromSubscription(
  sub: BillableSubscription,
  opts: { taxRate?: number; discountAmount?: number; discountLabel?: string } = {}
): { success: boolean; invoice?: Invoice; error?: string } {
  const invoices = getAllInvoices();

  const duplicate = invoices.find(
    (i) =>
      i.subscriptionId === sub.id &&
      i.billingDate === sub.nextBillingDate &&
      i.status !== 'CANCELLED'
  );
  if (duplicate) {
    return { success: false, error: `Already invoiced for this cycle (${duplicate.number}).` };
  }

  const taxRate = opts.taxRate ?? DEFAULT_TAX_RATE;
  const lines: InvoiceLine[] = sub.lines.map((l) => ({
    planId: l.planId,
    description: l.planName,
    quantity: l.quantity,
    unitPrice: l.unitPrice,
    taxRate,
    taxAmount: round2(l.lineTotal * taxRate),
    lineTotal: round2(l.lineTotal),
  }));

  const subtotal = round2(lines.reduce((s, l) => s + l.lineTotal, 0));
  const discountAmount = Math.min(round2(opts.discountAmount ?? 0), subtotal);
  const taxTotal = round2((subtotal - discountAmount) * taxRate);
  const total = round2(subtotal - discountAmount + taxTotal);

  const issue = new Date();
  const due = new Date(issue.getTime() + PAYMENT_TERMS_DAYS * 86400000);

  const invoice: Invoice = {
    id: 'inv_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    number: 'INV-' + String(invoices.length + 1).padStart(4, '0'),
    subscriptionId: sub.id,
    subscriptionNumber: sub.number,
    billingDate: sub.nextBillingDate,
    customerId: sub.customerId,
    customerName: sub.customerName,
    customerEmail: sub.customerEmail,
    lines,
    subtotal,
    discountAmount,
    discountLabel: opts.discountLabel,
    taxTotal,
    total,
    amountPaid: 0,
    status: 'DRAFT',
    issueDate: issue.toISOString(),
    dueDate: due.toISOString(),
    createdAt: issue.toISOString(),
  };

  invoices.push(invoice);
  writeJson(INVOICES_FILE, invoices);
  return { success: true, invoice };
}

// Draft -> Confirmed, or cancel
export function changeInvoiceStatus(
  id: string,
  action: 'confirm' | 'cancel'
): { success: boolean; invoice?: Invoice; error?: string } {
  const invoices = getAllInvoices();
  const inv = invoices.find((i) => i.id === id);
  if (!inv) return { success: false, error: 'Invoice not found.' };

  if (action === 'confirm') {
    if (inv.status !== 'DRAFT') return { success: false, error: 'Only draft invoices can be confirmed.' };
    inv.status = 'CONFIRMED';
  } else {
    if (inv.status === 'PAID') return { success: false, error: 'A paid invoice cannot be cancelled.' };
    inv.status = 'CANCELLED';
  }
  writeJson(INVOICES_FILE, invoices);
  return { success: true, invoice: inv };
}

// Record a payment; invoice becomes PAID once fully covered
export function recordPayment(data: {
  invoiceId: string;
  method: PaymentMethod;
  amount: number;
  date?: string;
  note?: string;
}): { success: boolean; payment?: Payment; invoice?: Invoice; error?: string } {
  const invoices = getAllInvoices();
  const inv = invoices.find((i) => i.id === data.invoiceId);
  if (!inv) return { success: false, error: 'Invoice not found.' };
  if (inv.status !== 'CONFIRMED') {
    return { success: false, error: 'Payments can only be recorded on confirmed invoices.' };
  }

  const amount = round2(Number(data.amount));
  const remaining = round2(inv.total - inv.amountPaid);
  if (!(amount > 0)) return { success: false, error: 'Amount must be greater than 0.' };
  if (amount > remaining) return { success: false, error: `Amount exceeds the outstanding balance (${remaining}).` };

  const payment: Payment = {
    id: 'pay_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    invoiceId: inv.id,
    customerId: inv.customerId,
    method: data.method,
    amount,
    date: data.date || new Date().toISOString(),
    note: data.note?.trim() || '',
    createdAt: new Date().toISOString(),
  };

  inv.amountPaid = round2(inv.amountPaid + amount);
  if (inv.amountPaid >= inv.total) inv.status = 'PAID';

  const payments = getAllPayments();
  payments.push(payment);
  writeJson(PAYMENTS_FILE, payments);
  writeJson(INVOICES_FILE, invoices);
  return { success: true, payment, invoice: inv };
}

// Numbers for the finance dashboard (one pass over the data)
export function getInvoiceSummary() {
  const invoices = getAllInvoices();
  const now = new Date();
  let outstanding = 0, overdueAmount = 0, overdueCount = 0, paidCount = 0;
  for (const i of invoices) {
    if (i.status === 'PAID') paidCount++;
    if (i.status === 'CONFIRMED') {
      const owed = i.total - i.amountPaid;
      outstanding += owed;
      if (new Date(i.dueDate) < now) { overdueCount++; overdueAmount += owed; }
    }
  }
  const totalRevenue = getAllPayments().reduce((s, p) => s + p.amount, 0);
  return {
    totalInvoices: invoices.length,
    paidCount,
    outstanding: round2(outstanding),
    overdueCount,
    overdueAmount: round2(overdueAmount),
    totalRevenue: round2(totalRevenue),
  };
}
