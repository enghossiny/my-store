export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY ?? 'EGP';

export function formatPrice(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${CURRENCY} ${num.toFixed(2)}`;
}