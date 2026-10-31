import { NextResponse } from 'next/server';
import { getAllPlans, createPlan } from '@/lib/plans-storage';

export async function GET() {
  try {
    const plans = getAllPlans();
    return NextResponse.json({ plans });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch billing plans' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      name, productName, tagline, category, rates, minQuantity, 
      autoCloseOnEnd, canPause, canCancelEarly, canRenew, features 
    } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Plan name is required.' }, { status: 400 });
    }

    if (!rates || typeof rates !== 'object') {
      return NextResponse.json({ error: 'Pricing rates for daily, weekly, monthly, and yearly are required.' }, { status: 400 });
    }

    const newPlan = createPlan({
      name,
      productName: productName || 'Brightloop Service',
      tagline,
      category,
      rates: {
        daily: Number(rates.daily) || 10,
        weekly: Number(rates.weekly) || 50,
        monthly: Number(rates.monthly) || 180,
        yearly: Number(rates.yearly) || 1800,
      },
      minQuantity: Number(minQuantity) || 1,
      autoCloseOnEnd: Boolean(autoCloseOnEnd),
      canPause: Boolean(canPause),
      canCancelEarly: Boolean(canCancelEarly),
      canRenew: Boolean(canRenew),
      features: Array.isArray(features) ? features : undefined,
    });

    return NextResponse.json(
      {
        message: 'Plan created successfully.',
        plan: newPlan,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Failed to create plan.' }, { status: 500 });
  }
}
