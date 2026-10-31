import type { BillingInterval } from './plans-types';

export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';

export interface SubscriptionLine {
  planId: string;
  planName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Subscription {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  planId: string;
  planName: string;
  interval: BillingInterval;
  quantity: number;
  unitPrice: number;
  total: number;
  status: SubscriptionStatus;
  startDate: string;
  nextBillingDate: string;
  endDate?: string;
  lines: SubscriptionLine[];
  createdAt: string;
  updatedAt: string;
}
