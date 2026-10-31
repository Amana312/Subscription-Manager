import fs from 'fs';
import path from 'path';
import { Product, ProductVariant, ProductType } from './catalog-types';

const DATA_DIR = path.join(process.cwd(), '.data');
const CATALOG_FILE = path.join(DATA_DIR, 'catalog.json');

function initCatalogStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(CATALOG_FILE)) {
    // Pre-seed with Brightloop products including the +560 Odoo brand variant
    const defaultProducts: Product[] = [
      {
        id: 'prod_brightloop_erp',
        name: 'Brightloop Business Suite',
        type: 'Software License',
        salesPrice: 1200,
        costPrice: 400,
        notes: 'Core business management system for small to large enterprises.',
        variants: [
          {
            id: 'var_odoo_brand',
            productId: 'prod_brightloop_erp',
            attributeName: 'Brand',
            attributeValue: 'Odoo Edition',
            priceModifier: 560, // The exact prompt requirement (+560 to price)
          },
          {
            id: 'var_standard_brand',
            productId: 'prod_brightloop_erp',
            attributeName: 'Brand',
            attributeValue: 'Standard Edition',
            priceModifier: 0,
          },
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'prod_cloud_storage',
        name: 'Dedicated Cloud Storage Add-on',
        type: 'Cloud Add-on',
        salesPrice: 150,
        costPrice: 35,
        notes: 'Secure cloud backup and storage block billed on recurring cycle.',
        variants: [
          {
            id: 'var_storage_2tb',
            productId: 'prod_cloud_storage',
            attributeName: 'Capacity',
            attributeValue: '2 TB High-Speed',
            priceModifier: 90,
          },
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'prod_user_seat',
        name: 'Additional Team Member Seat',
        type: 'User Seat',
        salesPrice: 45,
        costPrice: 8,
        notes: 'Per-user recurring seat for staff or manager accounts.',
        variants: [
          {
            id: 'var_seat_power',
            productId: 'prod_user_seat',
            attributeName: 'Privilege',
            attributeValue: 'Power User (API Access)',
            priceModifier: 20,
          },
        ],
        createdAt: new Date().toISOString(),
      },
    ];

    fs.writeFileSync(CATALOG_FILE, JSON.stringify(defaultProducts, null, 2), 'utf-8');
  }
}

export function getAllProducts(): Product[] {
  initCatalogStorage();
  try {
    const raw = fs.readFileSync(CATALOG_FILE, 'utf-8');
    return JSON.parse(raw) as Product[];
  } catch {
    return [];
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
}): Product {
  const products = getAllProducts();
  const newProduct: Product = {
    id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    name: data.name.trim(),
    type: data.type,
    salesPrice: Number(data.salesPrice) || 0,
    costPrice: Number(data.costPrice) || 0,
    notes: data.notes?.trim() || '',
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
