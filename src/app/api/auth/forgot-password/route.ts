import { NextResponse } from 'next/server';
import { findUserByEmail, updateUser, generateResetToken } from '@/lib/storage';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Please provide your registered email.' }, { status: 400 });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return NextResponse.json({
        message: 'If this email is registered, a password reset link has been sent.',
      });
    }

    const token = generateResetToken();
    const expiry = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour validity

    updateUser(user.id, {
      resetToken: token,
      resetTokenExpiry: expiry,
    });

    const resetLink = `/accounts?tab=reset&token=${token}`;

    return NextResponse.json({
      message: 'A password reset link has been dispatched to your email.',
      simulatedLink: resetLink,
      token: token,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to process password reset request.' }, { status: 500 });
  }
}
