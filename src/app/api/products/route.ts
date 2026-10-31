import { NextResponse } from 'next/server';
import { getAllProducts, createProduct } from '@/lib/catalog-storage';
import { ProductType } from '@/lib/catalog-types';

export async function GET() {
  try {
    const products = getAllProducts();
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch catalog products' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, type, salesPrice, costPrice, notes } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Product name is required.' }, { status: 400 });
    }

    if (salesPrice === undefined || isNaN(Number(salesPrice)) || Number(salesPrice) < 0) {
      return NextResponse.json({ error: 'Valid sales price is required.' }, { status: 400 });
    }

    const validTypes: ProductType[] = [
      'Software License',
      'Cloud Add-on',
      'Professional Service',
      'User Seat',
    ];

    const productType: ProductType = validTypes.includes(type) ? type : 'Software License';

    const newProduct = createProduct({
      name,
      type: productType,
      salesPrice: Number(salesPrice),
      costPrice: Number(costPrice) || 0,
      notes,
    });

    return NextResponse.json(
      {
        message: 'Product created successfully.',
        product: newProduct,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Failed to create product.' }, { status: 500 });
  }
}
