import fs from 'fs';
import path from 'path';
import { Product, ProductVariant, ProductType } from './catalog-types';

const DATA_DIR = path.join(process.cwd(), '.data');
const CATALOG_FILE = path.join(DATA_DIR, 'catalog.json');

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod_brightloop_erp',
    sku: 'BL-ERP-01',
    name: 'Brightloop Business Suite',
    type: 'Software License',
    category: 'Core Software',
    salesPrice: 1200,
    costPrice: 400,
    targetAudience: 'Mid-to-Large Enterprises',
    notes: 'All-in-one business software running accounting, inventory, subscriptions, and customer management.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    features: ['General Ledger & Invoicing', 'Subscription State Tracking', 'Multi-Currency Support', 'Automated Recurring Runs'],
    variants: [
      {
        id: 'var_odoo_brand',
        productId: 'prod_brightloop_erp',
        attributeName: 'Brand',
        attributeValue: 'Odoo Edition',
        priceModifier: 560, // Prompt requirement: choosing Odoo brand adds 560 to price
      },
      {
        id: 'var_standard_brand',
        productId: 'prod_brightloop_erp',
        attributeName: 'Brand',
        attributeValue: 'Brightloop Standard',
        priceModifier: 0,
      },
      {
        id: 'var_enterprise_edition',
        productId: 'prod_brightloop_erp',
        attributeName: 'Edition',
        attributeValue: 'Enterprise Cloud Pro',
        priceModifier: 380,
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod_retail_pos',
    sku: 'BL-POS-02',
    name: 'Brightloop POS & Retail Register',
    type: 'Software License',
    category: 'Retail & Sales',
    salesPrice: 450,
    costPrice: 120,
    targetAudience: 'Small Shops & Boutiques',
    notes: 'High-speed cloud point-of-sale system with barcode scanning, offline mode, and receipt sync.',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67e5572240?auto=format&fit=crop&w=600&q=80',
    features: ['Instant Barcode Checkout', 'Offline Transaction Sync', 'Thermal Receipt Printing', 'Shift Cash Reconciliation'],
    variants: [
      {
        id: 'var_pos_odoo',
        productId: 'prod_retail_pos',
        attributeName: 'Brand',
        attributeValue: 'Odoo POS Certified',
        priceModifier: 240,
      },
      {
        id: 'var_pos_standard',
        productId: 'prod_retail_pos',
        attributeName: 'Brand',
        attributeValue: 'Standalone Standard',
        priceModifier: 0,
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod_cloud_storage',
    sku: 'BL-STO-03',
    name: 'Encrypted Cloud Storage & Backup Vault',
    type: 'Cloud Add-on',
    category: 'Infrastructure',
    salesPrice: 150,
    costPrice: 35,
    targetAudience: 'All Business Sizes',
    notes: 'Daily automated database snapshots, document vault, and encrypted object storage.',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
    features: ['Daily Automated Backups', 'AES-256 Cloud Encryption', '1-Click Point-in-time Restore', '99.99% Availability SLA'],
    variants: [
      {
        id: 'var_storage_2tb',
        productId: 'prod_cloud_storage',
        attributeName: 'Capacity',
        attributeValue: '2 TB High-Speed SSD',
        priceModifier: 90,
      },
      {
        id: 'var_storage_5tb',
        productId: 'prod_cloud_storage',
        attributeName: 'Capacity',
        attributeValue: '5 TB Enterprise Vault',
        priceModifier: 220,
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod_ai_billing',
    sku: 'BL-AI-04',
    name: 'AI Revenue & Churn Predictor',
    type: 'Cloud Add-on',
    category: 'Intelligence',
    salesPrice: 280,
    costPrice: 60,
    targetAudience: 'Finance Leads & CFOs',
    notes: 'Smart machine learning copilot that forecasts monthly renewals, detects churn risks, and catches billing anomalies.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    features: ['Renewal Churn Warning Alerts', 'Automated Anomaly Detection', 'MRR Growth Forecast Modeling', 'Overdue Risk Scoring'],
    variants: [
      {
        id: 'var_ai_advanced',
        productId: 'prod_ai_billing',
        attributeName: 'Model Engine',
        attributeValue: 'Advanced Neural Engine',
        priceModifier: 150,
      },
      {
        id: 'var_ai_standard',
        productId: 'prod_ai_billing',
        attributeName: 'Model Engine',
        attributeValue: 'Standard Statistical',
        priceModifier: 0,
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod_user_seat',
    sku: 'BL-SET-05',
    name: 'Additional Team Member Seat',
    type: 'User Seat',
    category: 'Licensing',
    salesPrice: 45,
    costPrice: 8,
    targetAudience: 'Growing Organizations',
    notes: 'Per-seat recurring subscription with granular role-based permissions and audit activity logs.',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
    features: ['Dedicated User Login', 'Role-Based Access Control', 'Activity & Change Logging', 'Mobile Web App Access'],
    variants: [
      {
        id: 'var_seat_power',
        productId: 'prod_user_seat',
        attributeName: 'Privilege',
        attributeValue: 'Power User (Admin/API)',
        priceModifier: 25,
      },
      {
        id: 'var_seat_auditor',
        productId: 'prod_user_seat',
        attributeName: 'Privilege',
        attributeValue: 'Standard Staff',
        priceModifier: 0,
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod_priority_sla',
    sku: 'BL-SRV-06',
    name: 'Dedicated Enterprise SLA & Account Manager',
    type: 'Professional Service',
    category: 'Support',
    salesPrice: 650,
    costPrice: 200,
    targetAudience: 'Mission-Critical Operations',
    notes: 'Direct 24/7 technical escalation channel with 1-hour response SLA and a dedicated Brightloop solutions engineer.',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    features: ['1-Hour Response Guarantee', 'Direct Slack/Phone Channel', 'Monthly Architecture Review', 'Priority Hotfix Deployment'],
    variants: [
      {
        id: 'var_sla_247',
        productId: 'prod_priority_sla',
        attributeName: 'Tier',
        attributeValue: '24/7 Platinum Escalation',
        priceModifier: 350,
      },
      {
        id: 'var_sla_business',
        productId: 'prod_priority_sla',
        attributeName: 'Tier',
        attributeValue: 'Business Hours Gold',
        priceModifier: 0,
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod_tax_compliance',
    sku: 'BL-TAX-07',
    name: 'Automated Tax & Global Fiscal Pack',
    type: 'Cloud Add-on',
    category: 'Compliance',
    salesPrice: 190,
    costPrice: 40,
    targetAudience: 'International Merchants',
    notes: 'Automatic tax rates calculation across VAT, GST, and US State Sales Tax with e-invoicing compliance.',
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
    features: ['Real-time Tax Engine Rules', '120+ Countries VAT/GST', 'E-Invoice Validation XML', 'Quarterly Tax Summary Export'],
    variants: [
      {
        id: 'var_tax_global',
        productId: 'prod_tax_compliance',
        attributeName: 'Coverage',
        attributeValue: 'Global Multi-Region',
        priceModifier: 110,
      },
      {
        id: 'var_tax_single',
        productId: 'prod_tax_compliance',
        attributeName: 'Coverage',
        attributeValue: 'Single Jurisdiction',
        priceModifier: 0,
      },
    ],
    createdAt: new Date().toISOString(),
  },
];

function initCatalogStorage(forceReset = false) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // If forceReset or file missing or file has old small data, populate rich catalog
  if (!fs.existsSync(CATALOG_FILE) || forceReset) {
    fs.writeFileSync(CATALOG_FILE, JSON.stringify(DEFAULT_PRODUCTS, null, 2), 'utf-8');
    return;
  }

  try {
    const raw = fs.readFileSync(CATALOG_FILE, 'utf-8');
    const existing = JSON.parse(raw);
    if (!Array.isArray(existing) || existing.length < 5 || !existing[0].imageUrl) {
      fs.writeFileSync(CATALOG_FILE, JSON.stringify(DEFAULT_PRODUCTS, null, 2), 'utf-8');
    }
  } catch {
    fs.writeFileSync(CATALOG_FILE, JSON.stringify(DEFAULT_PRODUCTS, null, 2), 'utf-8');
  }
}

export function getAllProducts(): Product[] {
  initCatalogStorage();
  try {
    const raw = fs.readFileSync(CATALOG_FILE, 'utf-8');
    return JSON.parse(raw) as Product[];
  } catch {
    return DEFAULT_PRODUCTS;
  }
}

export function saveProducts(products: Product[]): void {
  initCatalogStorage();
  fs.writeFileSync(CATALOG_FILE, JSON.stringify(products, null, 2), 'utf-8');
}

export function getProductById(id: string): Product | undefined {
  const products = getAllProducts();
  return products.find((p) => p.id === id);
}

export function createProduct(data: {
  name: string;
  type: ProductType;
  salesPrice: number;
  costPrice: number;
  notes?: string;
  sku?: string;
  targetAudience?: string;
  imageUrl?: string;
  features?: string[];
}): Product {
  const products = getAllProducts();
  const skuNumber = Math.floor(10 + Math.random() * 90);
  const newProduct: Product = {
    id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    sku: data.sku || `BL-CUS-${skuNumber}`,
    name: data.name.trim(),
    type: data.type,
    category: data.type,
    salesPrice: Number(data.salesPrice) || 0,
    costPrice: Number(data.costPrice) || 0,
    targetAudience: data.targetAudience || 'General Business',
    notes: data.notes?.trim() || 'Custom recurring product.',
    imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    features: data.features && data.features.length > 0 ? data.features : ['Standard Subscription Feature', 'Recurring License Support'],
    variants: [],
    createdAt: new Date().toISOString(),
  };

  products.unshift(newProduct);
  saveProducts(products);
  return newProduct;
}

export function addVariantToProduct(
  productId: string,
  variantData: {
    attributeName: string;
    attributeValue: string;
    priceModifier: number;
  }
): ProductVariant | null {
  const products = getAllProducts();
  const productIndex = products.findIndex((p) => p.id === productId);
  if (productIndex === -1) return null;

  const newVariant: ProductVariant = {
    id: 'var_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    productId,
    attributeName: variantData.attributeName.trim(),
    attributeValue: variantData.attributeValue.trim(),
    priceModifier: Number(variantData.priceModifier) || 0,
  };

  products[productIndex].variants.push(newVariant);
  saveProducts(products);
  return newVariant;
}

export function deleteProduct(productId: string): boolean {
  const products = getAllProducts();
  const filtered = products.filter((p) => p.id !== productId);
  if (filtered.length === products.length) return false;
  saveProducts(filtered);
  return true;
}

export function deleteVariant(productId: string, variantId: string): boolean {
  const products = getAllProducts();
  const product = products.find((p) => p.id === productId);
  if (!product) return false;

  const initialCount = product.variants.length;
  product.variants = product.variants.filter((v) => v.id !== variantId);
  if (product.variants.length === initialCount) return false;

  saveProducts(products);
  return true;
}
