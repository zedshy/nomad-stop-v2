import { NextResponse } from 'next/server';

const WORLDPAY_USERNAME = process.env.WORLDPAY_USERNAME || '';
const WORLDPAY_PASSWORD = process.env.WORLDPAY_PASSWORD || '';
const WORLDPAY_ENTITY_ID = process.env.WORLDPAY_ENTITY_ID || '';
const WORLDPAY_ENV = process.env.WORLDPAY_ENVIRONMENT || 'production';

export async function POST() {
  if (!WORLDPAY_USERNAME || !WORLDPAY_PASSWORD || !WORLDPAY_ENTITY_ID) {
    return NextResponse.json(
      { error: 'Worldpay credentials are not fully configured' },
      { status: 500 },
    );
  }

  const sessionsUrl =
    WORLDPAY_ENV === 'sandbox'
      ? 'https://try.access.worldpay.com/access-checkout/v2/sessions'
      : 'https://access.worldpay.com/access-checkout/v2/sessions';

  try {
    const response = await fetch(sessionsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.worldpay.sessions-v1+json',
        Accept: 'application/vnd.worldpay.sessions-v1+json',
        Authorization: `Basic ${Buffer.from(`${WORLDPAY_USERNAME}:${WORLDPAY_PASSWORD}`).toString('base64')}`,
      },
      body: JSON.stringify({
        merchant: {
          entity: WORLDPAY_ENTITY_ID,
        },
        session: {
          order: {
            amount: 0,
            currencyCode: 'GBP',
            transactionReference: `session-${Date.now()}`,
          },
          payment: {
            amount: 0,
            currencyCode: 'GBP',
          },
          authentication: {
            type: 'card',
            cardNumber: true,
            cardSecurityCode: true,
            cardExpiryDate: true,
            cardholderName: true,
          },
        },
      }),
    });

    const text = await response.text();

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = text ? JSON.parse(text) : {};
      } catch {
        errorData = { message: text };
      }

      console.error('Worldpay session creation error:', {
        status: response.status,
        statusText: response.statusText,
        url: sessionsUrl,
        entityId: WORLDPAY_ENTITY_ID,
        environment: WORLDPAY_ENV,
        error: errorData,
      });

      const message =
        errorData?.message ||
        errorData?.description ||
        errorData?.error ||
        'Failed to create Worldpay session';

      return NextResponse.json(
        { error: 'Failed to create Worldpay session', message },
        { status: response.status },
      );
    }

    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error('Failed to parse Worldpay session response:', parseError, text);
      return NextResponse.json(
        { error: 'Failed to parse Worldpay session response' },
        { status: 500 },
      );
    }

    if (!data.id) {
      return NextResponse.json(
        { error: 'Worldpay session response missing id' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      id: data.id,
      expires: data.expires || null,
    });
  } catch (error: any) {
    console.error('Unexpected error creating Worldpay session:', error);
    return NextResponse.json(
      {
        error: 'Unexpected error creating Worldpay session',
        message: error?.message || 'Unknown error',
      },
      { status: 500 },
    );
  }
}


