import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { isAdminAuthenticated } from '@/app/admin/auth';

export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name_en, name_ar, delivery_fee } = await req.json();
  if (!name_en || !name_ar || delivery_fee == null) {
    return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 });
  }

  const { error, data } = await (supabaseAdmin as any).from('delivery_regions').insert({
    name_en,
    name_ar,
    delivery_fee: parseFloat(delivery_fee),
  }).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, region: data });
}
