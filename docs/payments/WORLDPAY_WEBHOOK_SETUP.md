# Worldpay Webhook Setup Guide

## ✅ Webhook Endpoint Already Created

Yes! The webhook endpoint is already set up at:

**URL:** `https://yourdomain.com/api/payments/worldpay/webhook`

**Method:** `POST`

## What the Webhook Does

The webhook endpoint (`src/app/api/payments/worldpay/webhook/route.ts`) handles:

1. **Signature Verification**: Verifies the webhook signature from Worldpay (currently accepts for testing)
2. **Payment Status Updates**: Updates payment and order status based on webhook events:
   - `captured` → Order status: `captured`
   - `voided` → Order status: `rejected`
   - `failed` → Order status: `rejected`
3. **Email Notifications**: Automatically sends order confirmation emails when payments are captured
4. **Error Handling**: Logs all webhook events for debugging

## How to Configure in Worldpay Dashboard

1. **Log into your Worldpay Dashboard** (sandbox: https://try.access.worldpay.com or production)

2. **Navigate to Webhooks/Notifications Settings**
   - Look for "Webhooks", "Notifications", or "API Settings"

3. **Add Webhook URL**
   - **Webhook URL**: `https://yourdomain.com/api/payments/worldpay/webhook`
   - **Events to Subscribe**: 
     - Payment Authorized
     - Payment Captured
     - Payment Voided
     - Payment Failed

4. **Get Webhook Secret (if required)**
   - Some Worldpay implementations provide a webhook secret key
   - If provided, add it to your `.env` file:
     ```
     WORLDPAY_WEBHOOK_SECRET=your_webhook_secret_here
     ```
   - Then implement proper HMAC signature verification in `src/lib/worldpay.ts`

## Testing Webhooks Locally

For local testing, you'll need to expose your local server to the internet:

1. **Option 1: Use ngrok** (Recommended for testing)
   ```bash
   # Install ngrok: https://ngrok.com/download
   ngrok http 3007
   # Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
   # Use: https://abc123.ngrok.io/api/payments/worldpay/webhook
   ```

2. **Option 2: Use Worldpay Webhook Testing Tool**
   - Some Worldpay dashboards have a webhook testing feature
   - Check the Worldpay developer documentation

## Webhook Payload Format

The webhook expects a JSON payload with:
```json
{
  "worldpayRef": "WP_123456789",
  "status": "captured",
  "amount": 1000,
  "currency": "GBP"
}
```

The `processWebhookPayload` function in `src/lib/worldpay.ts` handles parsing different Worldpay webhook formats.

## Security Notes

⚠️ **Current Implementation (Development/Testing)**:
- Accepts webhooks without signature verification for testing
- Logs all webhook events for debugging

✅ **Production Requirements**:
- Implement proper HMAC-SHA256 signature verification
- Add webhook secret to `.env` file
- Consider rate limiting
- Validate IP ranges (if Worldpay provides them)

## Webhook Logging

All webhook events are logged to your server console. Check your server logs for:
- Incoming webhook requests
- Signature verification results
- Payment status updates
- Email sending status

## Troubleshooting

**Webhook not receiving events?**
1. Verify the URL is publicly accessible
2. Check Worldpay dashboard for webhook delivery logs
3. Check server logs for incoming requests
4. Verify webhook is enabled in Worldpay dashboard

**Webhook signature verification failing?**
1. Check that `WORLDPAY_WEBHOOK_SECRET` is set correctly
2. Verify signature header name matches (`x-worldpay-signature`)
3. Check server logs for signature details

**Order status not updating?**
1. Verify the `worldpayRef` in the webhook matches a payment in your database
2. Check server logs for payment lookup errors
3. Ensure the webhook payload contains the correct `worldpayRef`

## Files

- **Webhook Endpoint**: `src/app/api/payments/worldpay/webhook/route.ts`
- **Webhook Utilities**: `src/lib/worldpay.ts` (functions: `verifyWebhookSignature`, `processWebhookPayload`)
- **Email Service**: `src/lib/email.ts` (used for order confirmations)

