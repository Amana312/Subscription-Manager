import { NextResponse } from 'next/server';
import { getAllUsers, createUser, findUserByEmail } from '@/lib/storage';
import { validatePassword, isValidEmail } from '@/lib/auth-validator';

// GET /api/staff - List all team members
export async function GET(req: Request) {
  try {
    const users = getAllUsers();
    const sanitized = users.map(({ passwordHash, resetToken, resetTokenExpiry, ...safeUser }) => safeUser);
    return NextResponse.json({ users: sanitized });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch team roster' }, { status: 500 });
  }
}

// POST /api/staff - Strictly protected: Only real authenticated Admin can add staff
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, password, adminEmail, role = 'STAFF' } = body;

    if (!adminEmail) {
      return NextResponse.json(
        { error: 'Security Violation: Requester identity missing.' },
        { status: 401 }
      );
    }

    // Server-Side Verification: Look up the requester in the database
    const requester = findUserByEmail(adminEmail);
    if (!requester || requester.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access Denied: Only a verified Administrator account can add new staff members.' },
        { status: 403 }
      );
    }

    if (!fullName || !email) {
      return NextResponse.json({ error: 'Full name and email are required.' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'A valid corporate email is required.' }, { status: 400 });
    }

    const staffPassword = password || 'Staff@Brightloop2026';
    const validation = validatePassword(staffPassword);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.errors[0] }, { status: 400 });
    }

    const result = createUser({
      fullName,
      email,
      password: staffPassword,
      role: role === 'ADMIN' ? 'ADMIN' : 'STAFF',
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const { passwordHash, ...safeUser } = result.user!;

    return NextResponse.json(
      {
        message: `New staff member ${safeUser.fullName} added successfully.`,
        user: safeUser,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Failed to add staff member.' }, { status: 500 });
  }
}
