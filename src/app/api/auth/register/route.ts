import { NextResponse } from 'next/server';
import { validatePassword, isValidEmail } from '@/lib/auth-validator';
import { createUser } from '@/lib/storage';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, password, role } = body;

    // FR1: Must provide full name, email, and password
    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return NextResponse.json({ error: 'Full name is required.' }, { status: 400 });
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    // FR3 / AC3: Password must be more than 8 characters, with upper, lower, special
    const validation = validatePassword(password);
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

    // FR2 / AC2: Unique email check
    const result = createUser({
      fullName,
      email,
      password,
      role: role === 'STAFF' || role === 'ADMIN' ? role : 'CUSTOMER',
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const { passwordHash, ...safeUser } = result.user!;

    // AC1: Successful creation
    return NextResponse.json(
      {
        message: 'Account created successfully.',
        user: safeUser,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: 'Server error during registration.' }, { status: 500 });
  }
}
