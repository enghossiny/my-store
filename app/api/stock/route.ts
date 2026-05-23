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
        return NextResponse.json({ error: selectError?.message ?? 'Product not found' }, { status: 400 });
      }

      const updatedStock = Math.max(0, (product.stock ?? 0) + adjustment.quantityDelta);
      const { error: updateError } = await supabaseAdmin
        .from('products')
        .update({ stock: updatedStock })
        .eq('id', adjustment.productId);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 });
      }

      results.push({ productId: adjustment.productId, stock: updatedStock });
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Stock adjust error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
