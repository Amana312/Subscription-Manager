import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getAllInvoices, isOverdue } from '@/lib/invoices-storage';

// GET /api/invoices?status=OVERDUE&q=acme&page=1&pageSize=20
export async function GET(req: Request) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const q = (url.searchParams.get('q') || '').toLowerCase();
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
  const pageSize = Math.min(100, Number(url.searchParams.get('pageSize')) || 20);

  let list = getAllInvoices();

  // Customers only ever see their own invoices
  if (session.role === 'CUSTOMER') {
    list = list.filter((i) => i.customerId === session.id);
  }

  if (status === 'OVERDUE') list = list.filter((i) => isOverdue(i));
  else if (status) list = list.filter((i) => i.status === status);

  if (q) {
    list = list.filter(
      (i) => i.number.toLowerCase().includes(q) || i.customerName.toLowerCase().includes(q)
    );
  }

  list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const total = list.length;
  const items = list
    .slice((page - 1) * pageSize, page * pageSize)
    .map((i) => ({ ...i, overdue: isOverdue(i) }));

  return NextResponse.json({ items, total, page, pageSize });
}
