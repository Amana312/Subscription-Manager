import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import {
  getInvoiceById,
  getPaymentsForInvoice,
  changeInvoiceStatus,
  isOverdue,
} from '@/lib/invoices-storage';

// GET /api/invoices/:id  -> one invoice plus its payments
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });

  const inv = getInvoiceById(params.id);
  // customers can only open their own invoices (404 so we don't reveal others exist)
  if (!inv || (session.role === 'CUSTOMER' && inv.customerId !== session.id)) {
    return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 });
  }
  return NextResponse.json({
    invoice: { ...inv, overdue: isOverdue(inv) },
    payments: getPaymentsForInvoice(inv.id),
  });
}

// PATCH /api/invoices/:id  body: { "action": "confirm" | "cancel" }
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
  if (session.role === 'CUSTOMER') {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const action = body?.action;
  if (action !== 'confirm' && action !== 'cancel') {
    return NextResponse.json({ error: 'action must be "confirm" or "cancel".' }, { status: 400 });
  }

  const result = changeInvoiceStatus(params.id, action);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ invoice: result.invoice });
}
