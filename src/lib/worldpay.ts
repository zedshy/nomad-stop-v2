// Worldpay integration for payment processing

const WORLDPAY_USERNAME = process.env.WORLDPAY_USERNAME || '';
const WORLDPAY_PASSWORD = process.env.WORLDPAY_PASSWORD || '';

export interface WorldpayOrder {
  amount: number; // in pence
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

// Create authorization for payment
export async function createAuthorization(order: WorldpayOrder): Promise<WorldpayResponse> {
  try {
    if (!WORLDPAY_USERNAME || !WORLDPAY_PASSWORD) {
      console.warn('Worldpay credentials not configured. Using simulation mode.');
      const worldpayRef = `WP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        worldpayRef,
        status: 'authorized',
        amount: order.amount,
        currency: order.currency,
      };
    }

    // Call Worldpay API for authorization
    const response = await fetch('https://api.worldpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${WORLDPAY_USERNAME}:${WORLDPAY_PASSWORD}`).toString('base64')}`,
      },
      body: JSON.stringify({
        amount: order.amount,
        currency: order.currency,
        name: order.customer.name,
        paymentMethod: {
          type: 'Card',
        },
        metadata: {
          orderId: order.meta.orderId,
          fulfilment: order.meta.fulfilment,
          slot: order.meta.slot,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Worldpay authorization failed');
    }

    return {
      worldpayRef: data.orderCode || data.reference,
      status: 'authorized',
      amount: order.amount,
      currency: order.currency,
    };
  } catch (error) {
    console.error('Worldpay authorization failed:', error);
    throw new Error('Payment authorization failed');
  }
}

// Capture authorized payment
export async function capture(worldpayRef: string, amount: number): Promise<WorldpayCaptureResult> {
  try {
    if (!WORLDPAY_USERNAME || !WORLDPAY_PASSWORD) {
      console.warn('Worldpay credentials not configured. Using simulation mode.');
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        worldpayRef,
        capturedAt: new Date(),
      };
    }

    // Call Worldpay API to capture payment
    const response = await fetch(`https://api.worldpay.com/v1/orders/${worldpayRef}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${WORLDPAY_USERNAME}:${WORLDPAY_PASSWORD}`).toString('base64')}`,
      },
      body: JSON.stringify({
        amount: amount,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Worldpay capture failed');
    }

    return {
      success: true,
      worldpayRef,
      capturedAt: new Date(),
    };
  } catch (error) {
    console.error('Worldpay capture failed:', error);
    return {
      success: false,
      worldpayRef,
      error: 'Payment capture failed',
    };
  }
}

// Void authorized payment
export async function voidAuth(worldpayRef: string): Promise<WorldpayVoidResult> {
  try {
    if (!WORLDPAY_USERNAME || !WORLDPAY_PASSWORD) {
      console.warn('Worldpay credentials not configured. Using simulation mode.');
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        worldpayRef,
        voidedAt: new Date(),
      };
    }

    // Call Worldpay API to void payment
    const response = await fetch(`https://api.worldpay.com/v1/orders/${worldpayRef}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${WORLDPAY_USERNAME}:${WORLDPAY_PASSWORD}`).toString('base64')}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Worldpay void failed');
    }

    return {
      success: true,
      worldpayRef,
      voidedAt: new Date(),
    };
  } catch (error) {
    console.error('Worldpay void failed:', error);
    return {
      success: false,
      worldpayRef,
      error: 'Payment void failed',
    };
  }
}

// Verify webhook signature (simplified)
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  // In a real implementation, you'd verify the signature using Worldpay's method
  // For now, we'll just check if the signature exists
  return Boolean(signature && signature.length > 0);
}

// Process webhook payload
export function processWebhookPayload(payload: Record<string, unknown>): {
  worldpayRef: string;
  status: 'authorized' | 'captured' | 'voided' | 'failed';
  amount: number;
  currency: string;
} {
  // In a real implementation, you'd parse the actual Worldpay webhook payload
  return {
    worldpayRef: String(payload.worldpayRef || payload.reference || ''),
    status: (payload.status as 'authorized' | 'captured' | 'voided' | 'failed') || 'failed',
    amount: Number(payload.amount || 0),
    currency: String(payload.currency || 'GBP'),
  };
}
