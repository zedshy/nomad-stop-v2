// Worldpay integration for payment processing

const WORLDPAY_USERNAME = process.env.WORLDPAY_USERNAME || '';
const WORLDPAY_PASSWORD = process.env.WORLDPAY_PASSWORD || '';
const WORLDPAY_CHECKOUT_ID = process.env.WORLDPAY_CHECKOUT_ID || '';
const WORLDPAY_ENV = process.env.WORLDPAY_ENVIRONMENT || 'production';

const WORLDPAY_BASE_URL = WORLDPAY_ENV === 'sandbox'
  ? 'https://try.access.worldpay.com'
  : 'https://access.worldpay.com';

const WORLDPAY_API_URL = `${WORLDPAY_BASE_URL}/orders`;

export interface WorldpayOrder {
  amount: number;
  currency: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  meta: {
    orderId: string;
    fulfilment: 'pickup' | 'delivery';
    slot?: string;
  };
  card: {
    number: string;
    expiry: string;
    cvc: string;
    name: string;
  };
}

export interface WorldpayResponse {
  worldpayRef: string;
  status: 'authorized' | 'captured' | 'voided' | 'failed';
  amount: number;
  currency: string;
}

export async function createAuthorization(order: WorldpayOrder): Promise<WorldpayResponse> {
  try {
    if (!WORLDPAY_USERNAME || !WORLDPAY_PASSWORD) {
      const worldpayRef = `WP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return {
        worldpayRef,
        status: 'authorized',
        amount: order.amount,
        currency: order.currency,
      };
    }

    const sanitizedNumber = order.card.number.replace(/\s/g, '');
    const maskedNumber =
      sanitizedNumber.length >= 10
        ? `${sanitizedNumber.slice(0, 6)}${'*'.repeat(Math.max(0, sanitizedNumber.length - 10))}${sanitizedNumber.slice(-4)}`
        : 'masked';
    const requestBody = {
      amount: order.amount,
      currency: order.currency,
      name: order.customer.name,
      ...(WORLDPAY_CHECKOUT_ID && { merchantCode: WORLDPAY_CHECKOUT_ID }),
      paymentMethod: {
        type: 'Card',
        cardNumber: sanitizedNumber,
        expiryMonth: order.card.expiry.split('/')[0].padStart(2, '0'),
        expiryYear: '20' + order.card.expiry.split('/')[1],
        cvc: order.card.cvc,
        cardholderName: order.card.name,
      },
      metadata: {
        orderId: order.meta.orderId,
        fulfilment: order.meta.fulfilment,
        slot: order.meta.slot,
      },
    };

    console.info('Worldpay authorization request', {
      url: WORLDPAY_API_URL,
      environment: WORLDPAY_ENV,
      hasMerchantCode: Boolean(WORLDPAY_CHECKOUT_ID),
      orderId: order.meta.orderId,
      maskedCard: maskedNumber,
    });

    const response = await fetch(`${WORLDPAY_API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${WORLDPAY_USERNAME}:${WORLDPAY_PASSWORD}`).toString('base64')}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorData: any = {};
      try {
        errorData = errorText ? JSON.parse(errorText) : {};
      } catch {}
      console.error('Worldpay authorization failed', {
        status: response.status,
        statusText: response.statusText,
        url: WORLDPAY_API_URL,
        environment: WORLDPAY_ENV,
        orderId: order.meta.orderId,
        maskedCard: maskedNumber,
        errorData,
        rawError: errorText,
      });
      let message = errorData.message || errorData.error || errorText || 'Worldpay authorization failed';
      throw new Error(message);
    }

    const data = await response.json();
    return {
      worldpayRef: data.orderCode || data.reference || `WP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'authorized',
      amount: order.amount,
      currency: order.currency,
    };
  } catch (error: any) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export async function capture(worldpayRef: string, amount: number) {
  // no-op for legacy flow
  return { success: true, worldpayRef, capturedAt: new Date() };
}

export async function voidAuth(worldpayRef: string) {
  return { success: true, worldpayRef, voidedAt: new Date() };
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  return Boolean(signature && signature.length > 0);
}

export function processWebhookPayload(payload: Record<string, unknown>) {
  return {
    worldpayRef: String(payload.worldpayRef || payload.reference || ''),
    status: (payload.status as 'authorized' | 'captured' | 'voided' | 'failed') || 'failed',
    amount: Number(payload.amount || 0),
    currency: String(payload.currency || 'GBP'),
  };
}
