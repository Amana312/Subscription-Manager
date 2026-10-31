import { NextResponse } from 'next/server';
import { addVariantToProduct, deleteVariant, getProductById } from '@/lib/catalog-storage';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const body = await req.json();
    const { attributeName, attributeValue, priceModifier } = body;

    if (!attributeName || !attributeValue) {
      return NextResponse.json(
        { error: 'Attribute name (e.g. Brand) and value (e.g. Odoo) are required.' },
        { status: 400 }
      );
    }

    if (priceModifier === undefined || isNaN(Number(priceModifier))) {
      return NextResponse.json(
        { error: 'Valid price modifier (e.g. 560) is required.' },
        { status: 400 }
      );
    }

    const variant = addVariantToProduct(productId, {
      attributeName,
      attributeValue,
      priceModifier: Number(priceModifier),
    });

    if (!variant) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    const updatedProduct = getProductById(productId);

    return NextResponse.json(
      {
        message: 'Variant added successfully.',
        variant,
        product: updatedProduct,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Failed to add variant.' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const { searchParams } = new URL(req.url);
    const variantId = searchParams.get('variantId');

    if (!variantId) {
      return NextResponse.json({ error: 'variantId parameter is required.' }, { status: 400 });
    }

    const success = deleteVariant(productId, variantId);
    if (!success) {
      return NextResponse.json({ error: 'Variant not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Variant removed successfully.' });
  } catch {
    return NextResponse.json({ error: 'Failed to remove variant.' }, { status: 500 });
  }
}
