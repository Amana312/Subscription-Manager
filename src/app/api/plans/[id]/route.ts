import { NextResponse } from 'next/server';
import { deletePlan, getPlanById } from '@/lib/plans-storage';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const success = deletePlan(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Plan not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Plan deleted successfully.' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete plan.' }, { status: 500 });
  }
}
