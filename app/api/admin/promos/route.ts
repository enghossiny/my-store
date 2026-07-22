import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { isAdminAuthenticated } from '@/app/admin/auth';

export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  const {
    code,
    discount_type,
    discount_value,
    min_order_amount = 0,
    max_uses = null,
    expires_at = null,
  } = body;

  if (!code || discount_value == null || !discount_type) {
    return NextResponse.json(
      { error: 'Required fields are missing' },
      { status: 400 }
    );
  }

  const insertData = {
    code: code.trim().toUpperCase(),
    discount_type,
    discount_value: parseFloat(discount_value),
    min_order_amount: parseFloat(min_order_amount) || 0,
    max_uses: max_uses ? parseInt(max_uses, 10) : null,
    expires_at: expires_at || null,
    active: true,
  };

  const { error, data } = await (supabaseAdmin as any)
    .from('promo_codes')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    promo: data,
  });
}