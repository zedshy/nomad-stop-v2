// Worldpay integration for payment processing
import crypto from 'crypto';

const WORLDPAY_USERNAME = process.env.WORLDPAY_USERNAME || '';
const WORLDPAY_PASSWORD = process.env.WORLDPAY_PASSWORD || '';
const WORLDPAY_CHECKOUT_ID = process.env.WORLDPAY_CHECKOUT_ID || '';
const WORLDPAY_ENTITY_ID = process.env.WORLDPAY_ENTITY_ID || '';
const WORLDPAY_ENV = process.env.WORLDPAY_ENVIRONMENT || 'production';
const WORLDPAY_WEBHOOK_SECRET = process.env.WORLDPAY_WEBHOOK_SECRET || '';

const WORLDPAY_BASE_URL = WORLDPAY_ENV === 'sandbox'
  ? 'https://try.access.worldpay.com'
  : 'https://access.worldpay.com';

const WORLDPAY_API_URL = `${WORLDPAY_BASE_URL}/payments/authorizations`;

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

export interface WorldpayCaptureResult {
  success: boolean;
  worldpayRef: string;
  capturedAt?: Date;
  error?: string;
}

export interface WorldpayVoidResult {
  success: boolean;
  worldpayRef: string;
  voidedAt?: Date;
  error?: string;
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

    console.info('Worldpay env check', {
      usernamePresent: Boolean(WORLDPAY_USERNAME),
      passwordPresent: Boolean(WORLDPAY_PASSWORD),
      entityId: WORLDPAY_ENTITY_ID,
      checkoutId: WORLDPAY_CHECKOUT_ID,
      environment: WORLDPAY_ENV,
      apiUrl: WORLDPAY_API_URL,
    });

    const sanitizedNumber = order.card.number.replace(/\s/g, '');
    const maskedNumber =
      sanitizedNumber.length >= 10
        ? `${sanitizedNumber.slice(0, 6)}${'*'.repeat(Math.max(0, sanitizedNumber.length - 10))}${sanitizedNumber.slice(-4)}`
        : 'masked';
    const [expiryMonthRaw, expiryYearRaw] = order.card.expiry.split('/');
    const shortReference = order.meta.orderId.slice(0, 24);

    const requestBody: Record<string, unknown> = {
      transactionReference: order.meta.orderId,
      merchant: WORLDPAY_ENTITY_ID ? { entity: WORLDPAY_ENTITY_ID } : undefined,
      instruction: {
        value: {
          currency: order.currency,
          amount: order.amount,
        },
        narrative: {
          line1: shortReference,
        },
        amount: {
          currency: order.currency,
          value: order.amount,
        },
        paymentInstrument: {
          type: 'card/plain',
          cardHolderName: order.card.name,
          cardNumber: sanitizedNumber,
          cardExpiryDate: {
            month: Number(expiryMonthRaw),
            year: Number(expiryYearRaw.length === 2 ? `20${expiryYearRaw}` : expiryYearRaw),
          },
          cardSecurityCode: order.card.cvc,
        },
      },
    };
    if (!requestBody.merchant) {
      delete requestBody.merchant;
    }

    console.info('Worldpay authorization request', {
      url: WORLDPAY_API_URL,
      environment: WORLDPAY_ENV,
      hasMerchantCode: Boolean(WORLDPAY_CHECKOUT_ID),
      orderId: order.meta.orderId,
      maskedCard: maskedNumber,
      payload: requestBody,
    });

    const versionedMediaType = 'application/vnd.worldpay.payments-v6+json';

    const response = await fetch(`${WORLDPAY_API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': versionedMediaType,
        Accept: versionedMediaType,
        Authorization: `Basic ${Buffer.from(`${WORLDPAY_USERNAME}:${WORLDPAY_PASSWORD}`).toString('base64')}`,
      },
      body: JSON.stringify(requestBody),
    });

    const rawResponse = await response.text().catch(() => '');

    if (!response.ok) {
      const errorText = rawResponse;
      let errorData: Record<string, unknown> = {};
      try {
        errorData = errorText ? (JSON.parse(errorText) as Record<string, unknown>) : {};
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
      const message =
        (typeof errorData.message === 'string' && errorData.message) ||
        (typeof errorData.error === 'string' && errorData.error) ||
        errorText ||
        'Worldpay authorization failed';
      throw new Error(message);
    }

    let data: Record<string, unknown> = {};
    try {
      data = rawResponse ? JSON.parse(rawResponse) : {};
    } catch (parseError) {
      console.error('Failed to parse Worldpay success response', parseError, rawResponse);
      throw new Error('Worldpay returned an unreadable response');
    }

    const payment = data.payment && typeof data.payment === 'object' ? data.payment as Record<string, unknown> : null;
    const outcome = data.outcome && typeof data.outcome === 'object' ? data.outcome as Record<string, unknown> : null;
    
    return {
      worldpayRef:
        (payment?.id && typeof payment.id === 'string' ? payment.id : null) ||
        (data.paymentId && typeof data.paymentId === 'string' ? data.paymentId : null) ||
        (data.reference && typeof data.reference === 'string' ? data.reference : null) ||
        `WP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status:
        (outcome?.code === 'APPROVED' || outcome?.code === 'AUTHORISED'
          ? 'authorized'
          : 'failed'),
      amount: order.amount,
      currency: order.currency,
    };
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export async function capture(worldpayRef: string, amount: number): Promise<WorldpayCaptureResult> {
  try {
    if (!WORLDPAY_USERNAME || !WORLDPAY_PASSWORD) {
      return { success: true, worldpayRef, capturedAt: new Date() };
    }

    const url = `${WORLDPAY_API_URL}/${worldpayRef}/capture`;
    const body = {
      amount,
      currency: 'GBP',
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${WORLDPAY_USERNAME}:${WORLDPAY_PASSWORD}`).toString('base64')}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Capture failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return {
      success: true,
      worldpayRef,
      capturedAt: new Date(),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error during capture';
    return {
      success: false,
      worldpayRef,
      error: message,
    };
  }
}

export async function voidAuth(worldpayRef: string): Promise<WorldpayVoidResult> {
  try {
    if (!WORLDPAY_USERNAME || !WORLDPAY_PASSWORD) {
      return { success: true, worldpayRef, voidedAt: new Date() };
    }

    const url = `${WORLDPAY_API_URL}/${worldpayRef}/void`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${WORLDPAY_USERNAME}:${WORLDPAY_PASSWORD}`).toString('base64')}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Void failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return {
      success: true,
      worldpayRef,
      voidedAt: new Date(),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error during void';
    return {
      success: false,
      worldpayRef,
      error: message,
    };
  }
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (!signature || !WORLDPAY_WEBHOOK_SECRET) {
    return false;
  }

  const hmac = crypto.createHmac('sha256', WORLDPAY_WEBHOOK_SECRET);
  hmac.update(payload, 'utf8');
  const digest = hmac.digest('hex');

  return digest === signature;
}

export function processWebhookPayload(payload: Record<string, unknown>) {
  return {
    worldpayRef: String(payload.worldpayRef || payload.reference || ''),
    status: (payload.status as 'authorized' | 'captured' | 'voided' | 'failed') || 'failed',
    amount: Number(payload.amount || 0),
    currency: String(payload.currency || 'GBP'),
  };
}
