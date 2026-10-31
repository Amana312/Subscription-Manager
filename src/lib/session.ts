import { cookies } from 'next/headers';
import { UserRole } from './types';

export interface Session {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

// Reads the login cookie that Person A's /api/auth/login sets
export function getSession(): Session | null {
  const raw = cookies().get('brightloop_session')?.value;
  if (!raw) return null;
  for (const candidate of [raw, safeDecode(raw)]) {
    try {
      const s = JSON.parse(candidate);
      if (s && s.id && s.role) return s as Session;
    } catch {
      /* try the next form */
    }
  }
  return null;
}

function safeDecode(v: string) {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}
