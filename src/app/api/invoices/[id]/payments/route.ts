import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { recordPayment } from '@/lib/invoices-storage';
import { PaymentMethod } from '@/lib/invoices-types';

const METHODS: PaymentMethod[] = ['CARD', 'BANK_TRANSFER', 'UPI', 'CASH', 'CHEQUE'];

// POST /api/invoices/:id/payments
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
  if (session.role === 'CUSTOMER') {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  if (!METHODS.includes(body?.method)) {
    return NextResponse.json({ error: 'Invalid payment method.' }, { status: 400 });
  }

  const result = recordPayment({
    invoiceId: params.id,
    method: body.method,
    amount: Number(body.amount),
    date: body.date,
    note: body.note,
  });
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ payment: result.payment, invoice: result.invoice }, { status: 201 });
}
