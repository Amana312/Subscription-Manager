import { NextResponse } from 'next/server';
import { findUserByEmail, comparePassword } from '@/lib/storage';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // FR4 / FR5: Login credentials check
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const user = findUserByEmail(email);
    if (!user) {
      // AC5: Incorrect credentials do not allow access
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isMatch = comparePassword(password, user.passwordHash);
    if (!isMatch) {
      // AC5: Incorrect credentials
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // AC4: User can log in successfully
    const { passwordHash, resetToken, resetTokenExpiry, ...safeUser } = user;

    const response = NextResponse.json({
      message: 'Logged in successfully.',
      user: safeUser,
    });

    response.cookies.set({
      name: 'brightloop_session',
      value: JSON.stringify({ id: user.id, email: user.email, role: user.role, name: user.fullName }),
      httpOnly: false,
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: 'Server error during login.' }, { status: 500 });
  }
}
