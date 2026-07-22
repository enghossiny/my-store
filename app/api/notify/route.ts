import { formatPrice } from '@/lib/currency';
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
        `  • ${item.name} ×${item.quantity} — ${formatPrice(item.price * item.quantity)}`
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
🚚 *Region:* ${region} — ${formatPrice(parseFloat(deliveryFee))}
${notes ? `📝 *Notes:* ${notes}` : ''}

🛍️ *Items:*
${itemsList}

💳 *Payment:* ${paymentLabel}
${discount ? `🎟️ *Promo:* ${promoCode} (−${formatPrice(parseFloat(discount))}` : ''}
🚚 *Delivery:* ${formatPrice(parseFloat(deliveryFee))}
💰 *Total: ${formatPrice(parseFloat(total))}*

🔗 [View in Admin](${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders)
    `.trim();

    // Send Telegram message with a timeout and graceful failure handling.
    let telegramSent = false;
    const timeoutMs = Number(process.env.TELEGRAM_TIMEOUT_MS ?? 15000);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      const result = await response.json().catch((e) => {
        console.error('Failed to parse Telegram response', e);
        return null;
      });

      telegramSent = Boolean(result?.ok);
      if (!telegramSent) {
        console.warn('Telegram send failed', result);
      }
    } catch {
      clearTimeout(timeoutId);
    }

    // Return success for the main API even if Telegram failed, to avoid cascading failures.
    return NextResponse.json({ success: true, telegramSent });
  } catch (err) {
    console.error('Telegram error:', err);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}