export type ProductType = 
  | 'Software License'
  | 'Cloud Add-on'
  | 'Professional Service'
  | 'User Seat';

export interface ProductVariant {
  id: string;
  productId: string;
  attributeName: string; // e.g. 'Brand', 'Edition', 'Region', 'Capacity'
  attributeValue: string; // e.g. 'Odoo', 'Enterprise', '2 TB'
  priceModifier: number; // e.g. +560
  costModifier?: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  type: ProductType;
  category: string;
  salesPrice: number;
  costPrice: number;
  targetAudience: string;
  notes: string;
  imageUrl: string;
  features: string[];
  variants: ProductVariant[];
  createdAt: string;
}

export interface PriceCalculation {
  basePrice: number;
  variantExtra: number;
  totalSalesPrice: number;
  estimatedMargin: number;
}

export function calculateUnitPrice(basePrice: number, variant?: ProductVariant | null): PriceCalculation {
  const variantExtra = variant ? Number(variant.priceModifier) || 0 : 0;
  const total = Number(basePrice) + variantExtra;
  return {
    basePrice,
    variantExtra,
    totalSalesPrice: total,
    estimatedMargin: total - basePrice,
  };
}
