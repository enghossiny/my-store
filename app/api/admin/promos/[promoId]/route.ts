import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { isAdminAuthenticated } from '@/app/admin/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ promoId: string }> }) {
  const { promoId } = await params;
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { active } = await req.json();

  if (active == null) {
    return NextResponse.json({ error: 'Missing active state' }, { status: 400 });
  }

const { error, data } = await (supabaseAdmin as any)
  .from('promo_codes')
  .update({ active })
  .eq('id', promoId)
  .select()
  .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, promo: data });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ promoId: string }> }) {
  const { promoId } = await params;
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }


const { error } = await (supabaseAdmin as any)
  .from('promo_codes')
  .delete()
  .eq('id', promoId);


  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
