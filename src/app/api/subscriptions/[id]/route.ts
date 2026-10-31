import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getSubscriptionById, updateSubscriptionStatus } from '@/lib/subscriptions-storage';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
  const sub = getSubscriptionById(params.id);
  if (!sub || (session.role === 'CUSTOMER' && sub.customerId !== session.id)) {
    return NextResponse.json({ error: 'Subscription not found.' }, { status: 404 });
  }
  return NextResponse.json({ subscription: sub });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
  if (session.role === 'CUSTOMER') {
    return NextResponse.json({ error: 'Only staff can change subscription status.' }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const action = body?.action;
  if (!['pause', 'resume', 'cancel', 'expire'].includes(action)) {
    return NextResponse.json({ error: 'Invalid subscription action.' }, { status: 400 });
  }
  const result = updateSubscriptionStatus(params.id, action);
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ subscription: result.subscription });
}
