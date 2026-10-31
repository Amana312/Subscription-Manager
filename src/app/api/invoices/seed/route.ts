import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { replaceAllData } from '@/lib/invoices-storage';
import { Invoice, Payment, PaymentMethod, InvoiceStatus } from '@/lib/invoices-types';

const CUSTOMERS = [
  { id: 'usr_customer', name: 'Acme Corp (Customer)', email: 'customer@brightloop.com' },
  { id: 'cus_globex', name: 'Globex Ltd', email: 'billing@globex.example' },
  { id: 'cus_initech', name: 'Initech', email: 'ap@initech.example' },
  { id: 'cus_umbrella', name: 'Umbrella Retail', email: 'finance@umbrella.example' },
  { id: 'cus_stark', name: 'Stark Logistics', email: 'accounts@stark.example' },
  { id: 'cus_wayne', name: 'Wayne Studios', email: 'pay@wayne.example' },
  { id: 'cus_hooli', name: 'Hooli Cloud', email: 'ar@hooli.example' },
  { id: 'cus_wonka', name: 'Wonka Foods', email: 'billing@wonka.example' },
];

const PLANS = [
  { id: 'plan_erp_suite', name: 'Enterprise Core ERP Plan', price: 320 },
  { id: 'plan_retail_pos', name: 'Retail POS Counter Plan', price: 140 },
  { id: 'plan_cloud_vault', name: 'Cloud Vault & Snapshot Plan', price: 90 },
  { id: 'plan_ai_revenue', name: 'AI Churn & Billing Copilot Plan', price: 220 },
  { id: 'plan_team_seats', name: 'Team Collaboration Seat Plan', price: 35 },
];

const METHODS: PaymentMethod[] = ['CARD', 'BANK_TRANSFER', 'UPI', 'CASH', 'CHEQUE'];
const r2 = (n: number) => Math.round(n * 100) / 100;
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

// GET /api/invoices/seed  (staff or admin) -> creates ~200 demo invoices
export async function GET() {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
  if (session.role === 'CUSTOMER') {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const COUNT = 200;
  const DAY = 86400000;
  const now = Date.now();
  const invoices: Invoice[] = [];
  const payments: Payment[] = [];

  for (let i = 0; i < COUNT; i++) {
    const cust = CUSTOMERS[i % CUSTOMERS.length];
    const plan = pick(PLANS);
    const qty = 1 + Math.floor(Math.random() * 5);
    const issued = now - Math.floor(Math.random() * 150) * DAY;
    const due = issued + 15 * DAY;

    const lineTotal = r2(plan.price * qty);
    const discount = Math.random() < 0.2 ? r2(lineTotal * 0.1) : 0;
    const taxTotal = r2((lineTotal - discount) * 0.18);
    const total = r2(lineTotal - discount + taxTotal);

    const roll = Math.random();
    let status: InvoiceStatus;
    if (roll < 0.45) status = 'PAID';
    else if (roll < 0.8) status = 'CONFIRMED';
    else if (roll < 0.92) status = 'DRAFT';
    else status = 'CANCELLED';

    let amountPaid = 0;
    const id = 'inv_seed_' + i;

    if (status === 'PAID') {
      amountPaid = total;
    } else if (status === 'CONFIRMED' && Math.random() < 0.25) {
      amountPaid = r2(total * 0.5); // part-paid
    }

    if (amountPaid > 0) {
      payments.push({
        id: 'pay_seed_' + i,
        invoiceId: id,
        customerId: cust.id,
        method: pick(METHODS),
        amount: amountPaid,
        date: new Date(Math.min(now, issued + Math.floor(Math.random() * 12) * DAY)).toISOString(),
        note: status === 'PAID' ? 'Paid in full' : 'Part payment',
        createdAt: new Date(issued).toISOString(),
      });
    }

    invoices.push({
      id,
      number: 'INV-' + String(i + 1).padStart(4, '0'),
      subscriptionId: 'sub_seed_' + i,
      subscriptionNumber: 'SUB-' + String(i + 1).padStart(4, '0'),
      billingDate: new Date(issued).toISOString(),
      customerId: cust.id,
      customerName: cust.name,
      customerEmail: cust.email,
      lines: [
        {
          planId: plan.id,
          description: plan.name,
          quantity: qty,
          unitPrice: plan.price,
          taxRate: 0.18,
          taxAmount: r2((lineTotal - discount) * 0.18),
          lineTotal,
        },
      ],
      subtotal: lineTotal,
      discountAmount: discount,
      discountLabel: discount ? '10% volume discount' : undefined,
      taxTotal,
      total,
      amountPaid,
      status,
      issueDate: new Date(issued).toISOString(),
      dueDate: new Date(due).toISOString(),
      createdAt: new Date(issued).toISOString(),
    });
  }

  replaceAllData(invoices, payments);
  return NextResponse.json({ seeded: invoices.length, payments: payments.length });
}
