import fs from 'fs';
import path from 'path';
import { getPlanById } from './plans-storage';
import { getPriceForInterval } from './plans-types';
import type { BillingInterval } from './plans-types';
import type { Subscription, SubscriptionStatus } from './subscriptions-types';

const DATA_DIR = path.join(process.cwd(), '.data');
const FILE = path.join(DATA_DIR, 'subscriptions.json');

function readAll(): Subscription[] {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '[]', 'utf-8');
  try { return JSON.parse(fs.readFileSync(FILE, 'utf-8')) as Subscription[]; }
  catch { return []; }
}
function writeAll(items: Subscription[]) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(items, null, 2), 'utf-8');
}
const round2 = (n: number) => Math.round(n * 100) / 100;

function addInterval(date: Date, interval: BillingInterval) {
  const next = new Date(date);
  if (interval === 'DAILY') next.setDate(next.getDate() + 1);
  if (interval === 'WEEKLY') next.setDate(next.getDate() + 7);
  if (interval === 'MONTHLY') next.setMonth(next.getMonth() + 1);
  if (interval === 'YEARLY') next.setFullYear(next.getFullYear() + 1);
  return next;
}

export function getAllSubscriptions() {
  return readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export function getSubscriptionById(id: string) {
  return readAll().find((s) => s.id === id);
}

export function createSubscription(input: {
  customerId: string;
  customerName: string;
  customerEmail: string;
  planId: string;
  interval: BillingInterval;
  quantity: number;
  startDate?: string;
}): { success: boolean; subscription?: Subscription; error?: string } {
  const plan = getPlanById(input.planId);
  if (!plan) return { success: false, error: 'Selected plan was not found.' };
  const quantity = Math.floor(Number(input.quantity));
  if (!Number.isFinite(quantity) || quantity < plan.minQuantity) {
    return { success: false, error: `Minimum quantity for this plan is ${plan.minQuantity}.` };
  }
  if (!['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].includes(input.interval)) {
    return { success: false, error: 'Choose a valid billing interval.' };
  }
  if (!input.customerId || !input.customerName.trim() || !input.customerEmail.trim()) {
    return { success: false, error: 'Customer details are required.' };
  }

  const start = input.startDate ? new Date(input.startDate) : new Date();
  if (Number.isNaN(start.getTime())) return { success: false, error: 'Invalid start date.' };
  const unitPrice = getPriceForInterval(plan.rates, input.interval);
  const now = new Date().toISOString();
  const items = readAll();
  const subscription: Subscription = {
    id: 'sub_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    number: 'SUB-' + String(items.length + 1).padStart(4, '0'),
    customerId: input.customerId,
    customerName: input.customerName.trim(),
    customerEmail: input.customerEmail.trim().toLowerCase(),
    planId: plan.id,
    planName: plan.name,
    interval: input.interval,
    quantity,
    unitPrice,
    total: round2(unitPrice * quantity),
    status: 'ACTIVE',
    startDate: start.toISOString(),
    nextBillingDate: addInterval(start, input.interval).toISOString(),
    lines: [{ planId: plan.id, planName: plan.name, quantity, unitPrice, lineTotal: round2(unitPrice * quantity) }],
    createdAt: now,
    updatedAt: now,
  };
  items.push(subscription);
  writeAll(items);
  return { success: true, subscription };
}

export function updateSubscriptionStatus(
  id: string,
  action: 'pause' | 'resume' | 'cancel' | 'expire'
): { success: boolean; subscription?: Subscription; error?: string } {
  const items = readAll();
  const sub = items.find((s) => s.id === id);
  if (!sub) return { success: false, error: 'Subscription not found.' };

  const transitions: Record<typeof action, { from: SubscriptionStatus[]; to: SubscriptionStatus }> = {
    pause: { from: ['ACTIVE'], to: 'PAUSED' },
    resume: { from: ['PAUSED'], to: 'ACTIVE' },
    cancel: { from: ['ACTIVE', 'PAUSED'], to: 'CANCELLED' },
    expire: { from: ['ACTIVE', 'PAUSED'], to: 'EXPIRED' },
  };
  const transition = transitions[action];
  if (!transition.from.includes(sub.status)) {
    return { success: false, error: `Cannot ${action} a ${sub.status.toLowerCase()} subscription.` };
  }
  if (action === 'pause' && !getPlanById(sub.planId)?.canPause) {
    return { success: false, error: 'This plan does not allow pausing.' };
  }
  if (action === 'cancel' && !getPlanById(sub.planId)?.canCancelEarly) {
    return { success: false, error: 'This plan does not allow early cancellation.' };
  }
  sub.status = transition.to;
  sub.updatedAt = new Date().toISOString();
  writeAll(items);
  return { success: true, subscription: sub };
}
