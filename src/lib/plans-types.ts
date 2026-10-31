export type BillingInterval = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface PlanPricing {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
}

export interface Plan {
  id: string;
  code: string;
  productId: string;
  productName: string;
  name: string;
  tagline: string;
  category: string;
  imageUrl: string; // High-res image
  colorGradient: string; // Vibrant gradient accent
  rates: PlanPricing;
  minQuantity: number;
  isPopular?: boolean;
  autoCloseOnEnd: boolean;
  canPause: boolean;
  canCancelEarly: boolean;
  canRenew: boolean;
  features: string[];
  createdAt: string;
}

export function getPriceForInterval(rates: PlanPricing, interval: BillingInterval): number {
  switch (interval) {
    case 'DAILY':
      return rates.daily;
    case 'WEEKLY':
      return rates.weekly;
    case 'MONTHLY':
      return rates.monthly;
    case 'YEARLY':
      return rates.yearly;
  }
}

export function formatIntervalLabel(interval: BillingInterval): string {
  switch (interval) {
    case 'DAILY':
      return '/ day';
    case 'WEEKLY':
      return '/ week';
    case 'MONTHLY':
      return '/ month';
    case 'YEARLY':
      return '/ year';
  }
}
