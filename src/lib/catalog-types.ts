export type ProductType = 
  | 'Software License'
  | 'Cloud Add-on'
  | 'Professional Service'
  | 'User Seat';

export interface ProductVariant {
  id: string;
  productId: string;
  attributeName: string; // e.g. 'Brand', 'Edition', 'Region'
  attributeValue: string; // e.g. 'Odoo', 'Enterprise', 'US-East'
  priceModifier: number; // e.g. +560
  costModifier?: number;
}

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  salesPrice: number;
  costPrice: number;
  notes: string;
  variants: ProductVariant[];
  createdAt: string;
}

export interface PriceCalculation {
  basePrice: number;
  variantExtra: number;
  totalSalesPrice: number;
  estimatedMargin: number; // salesPrice - costPrice
}

/**
 * Calculates final unit price based on base price + selected variant modifier
 */
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
