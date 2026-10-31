import fs from 'fs';
import path from 'path';
import { Plan, BillingInterval, PlanPricing } from './plans-types';

const DATA_DIR = path.join(process.cwd(), '.data');
const PLANS_FILE = path.join(DATA_DIR, 'plans.json');

const TEN_VIBRANT_PLANS: Plan[] = [
  {
    id: 'plan_erp_suite',
    code: 'PLN-ERP-01',
    productId: 'prod_brightloop_erp',
    productName: 'Brightloop Business Suite',
    name: 'Enterprise Core ERP Plan',
    tagline: 'Comprehensive operating system for growing companies and large enterprises.',
    category: 'Core Software',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    colorGradient: 'from-indigo-600 via-purple-600 to-pink-500',
    rates: {
      daily: 18,
      weekly: 95,
      monthly: 320,
      yearly: 3200,
    },
    minQuantity: 1,
    isPopular: true,
    autoCloseOnEnd: false,
    canPause: true,
    canCancelEarly: true,
    canRenew: true,
    features: ['General Ledger & Subscriptions', 'Odoo Brand Variant Support (+$560)', 'Automated Recurring Runs', 'Multi-Entity Financials'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'plan_retail_pos',
    code: 'PLN-POS-02',
    productId: 'prod_retail_pos',
    productName: 'Brightloop POS & Retail Register',
    name: 'Retail POS Counter Plan',
    tagline: 'High-speed checkout for small shops, boutiques, and multi-location retail.',
    category: 'Retail & POS',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67e5572240?auto=format&fit=crop&w=600&q=80',
    colorGradient: 'from-emerald-500 via-teal-600 to-cyan-600',
    rates: {
      daily: 8,
      weekly: 45,
      monthly: 140,
      yearly: 1400,
    },
    minQuantity: 1,
    autoCloseOnEnd: false,
    canPause: true,
    canCancelEarly: true,
    canRenew: true,
    features: ['Instant Barcode Scanner', 'Thermal Receipt Sync', 'Offline Checkout Mode', 'Cash Drawer Balancing'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'plan_cloud_vault',
    code: 'PLN-CLD-03',
    productId: 'prod_cloud_storage',
    productName: 'Encrypted Cloud Storage & Backup Vault',
    name: 'Cloud Vault & Snapshot Plan',
    tagline: 'Automated daily database backups and encrypted document storage.',
    category: 'Infrastructure',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
    colorGradient: 'from-blue-600 via-cyan-600 to-teal-500',
    rates: {
      daily: 5,
      weekly: 28,
      monthly: 90,
      yearly: 900,
    },
    minQuantity: 1,
    autoCloseOnEnd: false,
    canPause: true,
    canCancelEarly: true,
    canRenew: true,
    features: ['AES-256 Vault Encryption', 'Daily Snapshot Backups', 'Point-in-Time Database Restore', '2 TB / 5 TB Variant Expansion'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'plan_ai_revenue',
    code: 'PLN-AI-04',
    productId: 'prod_ai_billing',
    productName: 'AI Revenue & Churn Predictor',
    name: 'AI Churn & Billing Copilot Plan',
    tagline: 'Predictive intelligence detecting renewal drop-offs and overdue cashflow risks.',
    category: 'Intelligence',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    colorGradient: 'from-violet-600 via-purple-600 to-fuchsia-500',
    rates: {
      daily: 12,
      weekly: 65,
      monthly: 220,
      yearly: 2200,
    },
    minQuantity: 1,
    isPopular: true,
    autoCloseOnEnd: false,
    canPause: true,
    canCancelEarly: true,
    canRenew: true,
    features: ['Renewal Churn Warning System', 'Overdue Risk AI Scoring', 'MRR Predictive Modeling', 'Automated Anomaly Detection'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'plan_sla_platinum',
    code: 'PLN-SLA-05',
    productId: 'prod_priority_sla',
    productName: 'Dedicated Enterprise SLA & Account Manager',
    name: 'Enterprise 24/7 SLA Guarantee Plan',
    tagline: 'Mission-critical priority support with direct phone/Slack escalation.',
    category: 'Support',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    colorGradient: 'from-amber-500 via-orange-600 to-red-500',
    rates: {
      daily: 25,
      weekly: 140,
      monthly: 490,
      yearly: 4900,
    },
    minQuantity: 1,
    autoCloseOnEnd: false,
    canPause: true,
    canCancelEarly: false,
    canRenew: true,
    features: ['1-Hour Response Guarantee', 'Direct Slack Hotline', 'Dedicated Solutions Engineer', 'Priority Hotfix Lane'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'plan_team_seats',
    code: 'PLN-SET-06',
    productId: 'prod_user_seat',
    productName: 'Additional Team Member Seat',
    name: 'Team Collaboration Seat Plan',
    tagline: 'Scale seats across sales, finance, and support with granular RBAC permissions.',
    category: 'Licensing',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
    colorGradient: 'from-rose-500 via-pink-600 to-purple-600',
    rates: {
      daily: 2,
      weekly: 10,
      monthly: 35,
      yearly: 350,
    },
    minQuantity: 3,
    autoCloseOnEnd: false,
    canPause: true,
    canCancelEarly: true,
    canRenew: true,
    features: ['Min 3 Seats Required', 'Role-Based Access Control', 'Activity Audit Logging', 'Power User Privileges Add-on'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'plan_tax_global',
    code: 'PLN-TAX-07',
    productId: 'prod_tax_compliance',
    productName: 'Automated Tax & Global Fiscal Pack',
    name: 'Global Fiscal & Tax Engine Plan',
    tagline: 'Real-time calculation of VAT, GST, and US State Sales Tax with e-invoicing.',
    category: 'Compliance',
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
    colorGradient: 'from-blue-600 via-indigo-600 to-sky-500',
    rates: {
      daily: 6,
      weekly: 32,
      monthly: 110,
      yearly: 1100,
    },
    minQuantity: 1,
    autoCloseOnEnd: false,
    canPause: true,
    canCancelEarly: true,
    canRenew: true,
    features: ['120+ Countries VAT/GST Rules', 'E-Invoice XML Validation', 'Automatic Tax Rate Updates', 'Quarterly Tax Exports'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'plan_weekly_pilot',
    code: 'PLN-WEE-08',
    productId: 'prod_brightloop_erp',
    productName: 'Brightloop Business Suite',
    name: '7-Day Fast Evaluation Pilot Plan',
    tagline: 'Self-closing trial plan designed for short customer proof-of-concept tests.',
    category: 'Evaluation',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
    colorGradient: 'from-amber-400 via-yellow-500 to-orange-500',
    rates: {
      daily: 10,
      weekly: 49,
      monthly: 180,
      yearly: 1800,
    },
    minQuantity: 1,
    autoCloseOnEnd: true,
    canPause: false,
    canCancelEarly: true,
    canRenew: false,
    features: ['Closes Automatically When Ended', 'Zero Renewal Commitment', 'Full Feature Access During Pilot', '1-Click Upgrade to Annual'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'plan_security_audit',
    code: 'PLN-SEC-09',
    productId: 'prod_brightloop_erp',
    productName: 'Brightloop Business Suite',
    name: 'Zero-Trust Security & Audit Vault Plan',
    tagline: 'Enhanced compliance layer with IP whitelisting, SSO, and hardware key 2FA.',
    category: 'Security',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
    colorGradient: 'from-slate-800 via-emerald-700 to-teal-600',
    rates: {
      daily: 14,
      weekly: 75,
      monthly: 260,
      yearly: 2600,
    },
    minQuantity: 1,
    autoCloseOnEnd: false,
    canPause: true,
    canCancelEarly: true,
    canRenew: true,
    features: ['SAML 2.0 / Okta SSO', 'IP Whitelist Enforcement', 'Tamper-Proof Audit Vault', 'Annual SOC-2 Report Access'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'plan_api_gateway',
    code: 'PLN-API-10',
    productId: 'prod_brightloop_erp',
    productName: 'Brightloop Business Suite',
    name: 'High-Throughput API Gateway Plan',
    tagline: 'Dedicated integration pipeline for syncing subscriptions with ERPs and CRMs.',
    category: 'Developer',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    colorGradient: 'from-purple-700 via-indigo-700 to-blue-600',
    rates: {
      daily: 15,
      weekly: 80,
      monthly: 280,
      yearly: 2800,
    },
    minQuantity: 1,
    autoCloseOnEnd: false,
    canPause: true,
    canCancelEarly: true,
    canRenew: true,
    features: ['5,000,000 API Calls/Month', 'Real-Time Webhook Dispatcher', 'Dedicated API Rate Limiting', 'Developer Sandbox Access'],
    createdAt: new Date().toISOString(),
  },
];

function initPlansStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Always write vibrant plans with photos
  fs.writeFileSync(PLANS_FILE, JSON.stringify(TEN_VIBRANT_PLANS, null, 2), 'utf-8');
}

export function getAllPlans(): Plan[] {
  initPlansStorage();
  try {
    const raw = fs.readFileSync(PLANS_FILE, 'utf-8');
    return JSON.parse(raw) as Plan[];
  } catch {
    return TEN_VIBRANT_PLANS;
  }
}

export function savePlans(plans: Plan[]): void {
  initPlansStorage();
  fs.writeFileSync(PLANS_FILE, JSON.stringify(plans, null, 2), 'utf-8');
}

export function getPlanById(id: string): Plan | undefined {
  const plans = getAllPlans();
  return plans.find((p) => p.id === id);
}

export function createPlan(data: {
  name: string;
  productName: string;
  tagline?: string;
  category?: string;
  imageUrl?: string;
  colorGradient?: string;
  rates: PlanPricing;
  minQuantity?: number;
  autoCloseOnEnd?: boolean;
  canPause?: boolean;
  canCancelEarly?: boolean;
  canRenew?: boolean;
  features?: string[];
}): Plan {
  const plans = getAllPlans();
  const count = plans.length + 1;
  const code = `PLN-CUSTOM-${count < 10 ? '0' + count : count}`;

  const newPlan: Plan = {
    id: 'plan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    code,
    productId: 'prod_brightloop_erp',
    productName: data.productName || 'Brightloop Service',
    name: data.name.trim(),
    tagline: data.tagline?.trim() || 'Custom recurring plan with multi-frequency billing.',
    category: data.category || 'Custom Plan',
    imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    colorGradient: data.colorGradient || 'from-indigo-600 to-purple-600',
    rates: data.rates,
    minQuantity: Math.max(1, Number(data.minQuantity) || 1),
    autoCloseOnEnd: Boolean(data.autoCloseOnEnd),
    canPause: data.canPause !== undefined ? Boolean(data.canPause) : true,
    canCancelEarly: data.canCancelEarly !== undefined ? Boolean(data.canCancelEarly) : true,
    canRenew: data.canRenew !== undefined ? Boolean(data.canRenew) : true,
    features: data.features && data.features.length > 0 ? data.features : ['Standard Recurring Support', 'Pausable Billing Cycle'],
    createdAt: new Date().toISOString(),
  };

  plans.unshift(newPlan);
  savePlans(plans);
  return newPlan;
}

export function deletePlan(id: string): boolean {
  const plans = getAllPlans();
  const filtered = plans.filter((p) => p.id !== id);
  if (filtered.length === plans.length) return false;
  savePlans(filtered);
  return true;
}
