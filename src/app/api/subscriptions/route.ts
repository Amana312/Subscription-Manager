import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createSubscription, getAllSubscriptions } from '@/lib/subscriptions-storage';

export const runtime = 'nodejs';

export async function GET() {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });

  let items = getAllSubscriptions();
  if (session.role === 'CUSTOMER') {
    items = items.filter((s) => s.customerId === session.id);
  }
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const isCustomer = session.role === 'CUSTOMER';
  const result = createSubscription({
    customerId: isCustomer ? session.id : String(body.customerId || ''),
    customerName: isCustomer ? session.name : String(body.customerName || ''),
    customerEmail: isCustomer ? session.email : String(body.customerEmail || ''),
    planId: String(body.planId || ''),
    interval: body.interval,
    quantity: Number(body.quantity),
    startDate: body.startDate ? String(body.startDate) : undefined,
  });

  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ subscription: result.subscription }, { status: 201 });
}
