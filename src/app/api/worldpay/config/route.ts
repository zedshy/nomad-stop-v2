import { NextResponse } from 'next/server';

export async function GET() {
  const checkoutId =
    process.env.NEXT_PUBLIC_WORLDPAY_CHECKOUT_ID ||
    process.env.WORLDPAY_CHECKOUT_ID ||
    '';

  const environmentRaw =
    process.env.NEXT_PUBLIC_WORLDPAY_ENVIRONMENT ||
    process.env.WORLDPAY_ENVIRONMENT ||
    'sandbox';

  const environment =
    environmentRaw.toLowerCase() === 'production' ? 'production' : 'sandbox';

  return NextResponse.json({
    checkoutId,
    environment,
    configured: Boolean(checkoutId),
    entityId: process.env.WORLDPAY_ENTITY_ID || '',
  });
}

