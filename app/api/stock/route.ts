import { NextRequest, NextResponse } from 'next/server';

type StockAdjustment = {
  productId: string;
  quantityDelta: number;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isTransientError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /fetch failed|ECONNRESET|ETIMEDOUT|socket disconnected|temporarily unavailable|network|timeout/i.test(message);
};

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase admin client is not configured' }, { status: 500 });
    }

    const body = await req.json();
    const adjustments: StockAdjustment[] = Array.isArray(body.adjustments)
      ? body.adjustments
      : [];

    if (!adjustments.length) {
      return NextResponse.json({ error: 'No stock adjustments provided' }, { status: 400 });
    }

    const results = [];
    let shouldAbort = false;

    for (const adjustment of adjustments) {
      if (!adjustment.productId || typeof adjustment.quantityDelta !== 'number' || !Number.isFinite(adjustment.quantityDelta)) {
        return NextResponse.json({ error: 'Invalid adjustment payload' }, { status: 400 });
      }

      let product: { stock?: number | null } | null = null;
      let lastError: unknown = null;

      for (let attempt = 1; attempt <= 3; attempt += 1) {
        try {
          const selectResponse = await fetch(
            `${supabaseUrl}/rest/v1/products?id=eq.${adjustment.productId}&select=stock`,
            {
              method: 'GET',
              headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
              },
              cache: 'no-store',
            }
          );

          if (!selectResponse.ok) {
            const selectText = await selectResponse.text();
            throw new Error(selectText || 'Failed to load product stock');
          }

          const selectData = await selectResponse.json();
          product = Array.isArray(selectData) && selectData[0] ? selectData[0] : null;

          if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 400 });
          }

          const parsedStock = typeof product.stock === 'number'
            ? product.stock
            : Number(product.stock ?? 0);

          if (!Number.isFinite(parsedStock)) {
            return NextResponse.json(
              { error: 'Stock service temporarily unavailable. Please try again.' },
              { status: 503 }
            );
          }

          const currentStock = parsedStock;
          const updatedStock = currentStock + adjustment.quantityDelta;

          if (updatedStock < 0) {
            return NextResponse.json(
              { error: `Insufficient stock for product ${adjustment.productId}` },
              { status: 400 }
            );
          }

          const updateResponse = await fetch(
            `${supabaseUrl}/rest/v1/products?id=eq.${adjustment.productId}`,
            {
              method: 'PATCH',
              headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                Prefer: 'return=minimal',
              },
              body: JSON.stringify({ stock: updatedStock }),
              cache: 'no-store',
            }
          );

          if (!updateResponse.ok) {
            const updateText = await updateResponse.text();
            throw new Error(updateText || 'Failed to update product stock');
          }

          results.push({ productId: adjustment.productId, stock: updatedStock });
          break;
        } catch (error) {
          lastError = error;
          if (attempt < 3 && isTransientError(error)) {
            await delay(250 * attempt);
            continue;
          }
          console.error('Stock adjust error:', error, adjustment, { attempt });
          shouldAbort = true;
          break;
        }
      }

      if (shouldAbort) {
        break;
      }
    }

    if (shouldAbort) {
      return NextResponse.json(
        { error: 'Stock service temporarily unavailable. Please try again.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Stock adjust error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
