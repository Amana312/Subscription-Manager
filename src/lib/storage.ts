import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { User, UserRole } from './types';

const DATA_DIR = path.join(process.cwd(), '.data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure storage directory and file exist
function initStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    // Seed default accounts to win hackathon instantly
    const initialUsers: User[] = [
      {
        id: 'usr_admin',
        fullName: 'Brightloop Admin',
        email: 'admin@brightloop.com',
        passwordHash: hashPassword('Admin@12345'), // >8 chars, upper, lower, special
        role: 'ADMIN',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'usr_staff',
        fullName: 'Sarah Staff (Sales)',
        email: 'staff@brightloop.com',
        passwordHash: hashPassword('Staff@12345'),
        role: 'STAFF',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'usr_customer',
        fullName: 'Acme Corp (Customer)',
        email: 'customer@brightloop.com',
        passwordHash: hashPassword('Customer@12345'),
        role: 'CUSTOMER',
        createdAt: new Date().toISOString(),
      },
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(initialUsers, null, 2), 'utf-8');
  }
}

// Simple deterministic hash using Node crypto (no binary compile issues on Windows)
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'brightloop_salt').digest('hex');
}

export function comparePassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function generateResetToken(): string {
  return crypto.randomBytes(24).toString('hex');
}

export function getAllUsers(): User[] {
  initStorage();
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw) as User[];
  } catch (err) {
    return [];
  }
}

export function saveUsers(users: User[]): void {
  initStorage();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

export function findUserByEmail(email: string): User | undefined {
  const users = getAllUsers();
  return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

export function findUserByResetToken(token: string): User | undefined {
  const users = getAllUsers();
  const now = new Date();
  return users.find((u) => {
    if (u.resetToken !== token) return false;
    if (!u.resetTokenExpiry) return false;
    return new Date(u.resetTokenExpiry) > now;
  });
}

export function createUser(userData: {
  fullName: string;
  email: string;
  password: string;
  role?: UserRole;
}): { success: boolean; user?: User; error?: string } {
  const users = getAllUsers();
  const normalizedEmail = userData.email.trim().toLowerCase();

  // FR2 / AC2: Unique email check
  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return { success: false, error: 'Email already registered. Each email can belong to only one account.' };
  }

  const newUser: User = {
    id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    fullName: userData.fullName.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(userData.password),
    role: userData.role || 'CUSTOMER',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  return { success: true, user: newUser };
}

export function updateUser(id: string, updates: Partial<User>): boolean {
  const users = getAllUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return false;

  users[index] = { ...users[index], ...updates };
  saveUsers(users);
  return true;
}
