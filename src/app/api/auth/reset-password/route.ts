import { NextResponse } from 'next/server';
import { findUserByResetToken, updateUser, hashPassword } from '@/lib/storage';
import { validatePassword } from '@/lib/auth-validator';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and new password are required.' }, { status: 400 });
    }

    const user = findUserByResetToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired password reset link. Please request a new one.' },
        { status: 400 }
      );
    }

    // Must satisfy FR3 / AC3 rule
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: validation.errors[0] || 'Password does not meet requirements.',
          details: validation.errors,
          rules: validation.rules,
        },
        { status: 400 }
      );
    }

    updateUser(user.id, {
      passwordHash: hashPassword(newPassword),
      resetToken: undefined,
      resetTokenExpiry: undefined,
    });

    return NextResponse.json({
      message: 'Password successfully updated. You may now log in.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to reset password.' }, { status: 500 });
  }
}
