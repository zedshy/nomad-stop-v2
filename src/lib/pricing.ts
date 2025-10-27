import { config } from './config';

export interface PricingBreakdown {
  subtotal: number; // in pence
  deliveryFee: number; // in pence
  tip: number; // in pence
  serviceFee: number; // in pence
  total: number; // in pence
}

export function calculatePricing(
  subtotal: number,
  fulfilment: 'pickup' | 'delivery',
  tipPercent: number
): PricingBreakdown {
  // Calculate delivery fee
  const deliveryFee = fulfilment === 'delivery' && subtotal < config.delivery.freeOver 
    ? config.delivery.fee 
    : 0;

  // Calculate tip
  const tip = Math.round(subtotal * (tipPercent / 100));

  // Service fee (could be added for delivery orders)
  const serviceFee = 0; // No service fee for now

  const total = subtotal + deliveryFee + tip + serviceFee;

  return {
    subtotal,
    deliveryFee,
    tip,
    serviceFee,
    total,
  };
}

export function formatPrice(priceInPence: number): string {
  return `£${(priceInPence / 100).toFixed(2)}`;
}

export function parsePrice(priceString: string): number {
  // Remove £ and convert to pence
  const numericValue = parseFloat(priceString.replace('£', ''));
  return Math.round(numericValue * 100);
}
