import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderId, customerName, phone, address, total,
      items, notes, discount, promoCode,
      deliveryFee, region, paymentMethod, paymentReference,
    } = body;

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json({ error: 'Telegram not configured' }, { status: 500 });
    }

    const itemsList = items
      .map((item: { name: string; quantity: number; price: number }) =>
        `  • ${item.name} ×${item.quantity} — EGP ${(item.price * item.quantity).toFixed(2)}`
      ).join('\n');

    const paymentLabel =
      paymentMethod === 'cod' ? '💵 Cash on Delivery'
      : paymentMethod === 'instapay' ? `📲 InstaPay — Ref: ${paymentReference}`
      : `📱 Mobile Wallet — From: ${paymentReference}`;

    const message = `
🛒 *New Order Received!*

📦 *Order ID:* \`${orderId.slice(0, 8)}...\`
👤 *Customer:* ${customerName}
📞 *Phone:* ${phone}
📍 *Address:* ${address}
🚚 *Region:* ${region} — EGP ${deliveryFee}
${notes ? `📝 *Notes:* ${notes}` : ''}

🛍️ *Items:*
${itemsList}

💳 *Payment:* ${paymentLabel}
${discount ? `🎟️ *Promo:* ${promoCode} (−EGP ${discount})` : ''}
🚚 *Delivery:* EGP ${deliveryFee}
💰 *Total: EGP ${total}*

🔗 [View in Admin](${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders)
    `.trim();

    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      }
    );

    const result = await response.json();
    if (!result.ok) {
      return NextResponse.json({ error: result.description }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Telegram error:', err);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}