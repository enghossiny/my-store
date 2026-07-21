import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type StockAdjustment = {
  productId: string;
  quantityDelta: number;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const adjustments: StockAdjustment[] = Array.isArray(body.adjustments)
      ? body.adjustments
      : [];

    if (!adjustments.length) {
      return NextResponse.json({ error: 'No stock adjustments provided' }, { status: 400 });
    }

    const results = [];

    for (const adjustment of adjustments) {
      if (!adjustment.productId || typeof adjustment.quantityDelta !== 'number') {
        return NextResponse.json({ error: 'Invalid adjustment payload' }, { status: 400 });
      }

      const { data: product, error: selectError } = await supabaseAdmin
        .from('products')
        .select('stock')
        .eq('id', adjustment.productId)
        .single();

      if (selectError || !product) {
        const message = selectError?.message || 'Product not found';
        console.error('Stock select error:', message, adjustment);
        return NextResponse.json({ error: message }, { status: 400 });
      }

      const currentStock = product.stock ?? 0;
      const updatedStock = currentStock + adjustment.quantityDelta;

      if (updatedStock < 0) {
        return NextResponse.json(
          { error: `Insufficient stock for product ${adjustment.productId}` },
          { status: 400 }
        );
      }

      const { error: updateError } = await supabaseAdmin
        .from('products')
        .update({ stock: updatedStock })
        .eq('id', adjustment.productId);

      if (updateError) {
        console.error('Stock update error:', updateError.message, adjustment);
        return NextResponse.json({ error: updateError.message }, { status: 400 });
      }

      results.push({ productId: adjustment.productId, stock: updatedStock });
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Stock adjust error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
