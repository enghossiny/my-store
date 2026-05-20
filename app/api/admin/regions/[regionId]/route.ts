import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { isAdminAuthenticated } from '@/app/admin/auth';

export async function PATCH(req: NextRequest, { params }: { params: { regionId: string } }) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { regionId } = params;
  const { active } = await req.json();
  if (active == null) {
    return NextResponse.json({ error: 'Missing active state' }, { status: 400 });
  }

  const { error, data } = await supabaseAdmin.from('delivery_regions').update({ active }).eq('id', regionId).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, region: data });
}

export async function PUT(req: NextRequest, { params }: { params: { regionId: string } }) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { regionId } = params;
  const { name_en, name_ar, delivery_fee } = await req.json();
  if (!name_en || !name_ar || delivery_fee == null) {
    return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 });
  }

  const { error, data } = await supabaseAdmin.from('delivery_regions').update({
    name_en,
    name_ar,
    delivery_fee: parseFloat(delivery_fee),
  }).eq('id', regionId).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, region: data });
}

export async function DELETE(req: NextRequest, { params }: { params: { regionId: string } }) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { regionId } = params;
  const { error } = await supabaseAdmin.from('delivery_regions').delete().eq('id', regionId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
