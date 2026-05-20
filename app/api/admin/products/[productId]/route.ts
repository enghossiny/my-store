import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { isAdminAuthenticated } from '@/app/admin/auth';

export async function PUT(req: NextRequest, { params }: { params: { productId: string } }) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productId } = params;
  const body = await req.json();
  const {
    name_en,
    name_ar,
    description_en = '',
    description_ar = '',
    price,
    stock = 0,
    category_id = null,
    images = [],
  } = body;

  if (!name_en || !name_ar || price == null) {
    return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 });
  }

  const { error, data } = await supabaseAdmin.from('products').update({
    name_en,
    name_ar,
    description_en,
    description_ar,
    price: parseFloat(price),
    stock: parseInt(stock, 10) || 0,
    category_id: category_id || null,
    images,
  }).eq('id', productId).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, product: data });
}

export async function DELETE(req: NextRequest, { params }: { params: { productId: string } }) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productId } = params;
  const { error } = await supabaseAdmin.from('products').delete().eq('id', productId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
