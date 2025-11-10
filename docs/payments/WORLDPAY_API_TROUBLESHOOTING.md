# Worldpay API Troubleshooting Guide

## Current Error: "Requested endpoint was not found"

This error typically means:
1. **Incorrect API URL structure**
2. **Missing merchant/checkout ID in URL path**
3. **Wrong sandbox URL**

## Current Configuration

**Test Credentials:**
- Username: `FLqXjpulT3yagXaG`
- Password: `HKKXG61hz8Aw2D2o8Mmye4YVqPJmCWmCxx8fG96ELclrKW9EDGBcQgAe5gvs9oXp`
- Checkout ID: `5d6c2c97-be19-4b97-b9a9-676cf5412c19`
- Environment: `sandbox`

## URL Formats Being Tried

The code now tries both formats:

**Format 1 (without checkout ID):**
```
https://try.access.worldpay.com/v1/orders
```

**Format 2 (with checkout ID in path):**
```
https://try.access.worldpay.com/v1/merchants/5d6c2c97-be19-4b97-b9a9-676cf5412c19/orders
```

## Next Steps to Debug

1. **Check Server Console Logs**
   - Look for: `Worldpay API error:` logs
   - Check what URL is actually being called
   - Check the full error response

2. **Verify Worldpay API Documentation**
   - Check your Worldpay merchant portal for the correct API endpoint
   - Verify if checkout ID should be in the URL path
   - Confirm the sandbox base URL

3. **Test with curl or Postman**
   ```bash
   curl -X POST https://try.access.worldpay.com/v1/orders \
     -H "Content-Type: application/json" \
     -H "Authorization: Basic $(echo -n 'FLqXjpulT3yagXaG:HKKXG61hz8Aw2D2o8Mmye4YVqPJmCWmCxx8fG96ELclrKW9EDGBcQgAe5gvs9oXp' | base64)" \
     -d '{"amount":100,"currency":"GBP","name":"Test User"}'
   ```

4. **Check Worldpay Merchant Portal**
   - Log into your Worldpay test account
   - Navigate to API Settings or Developer Tools
   - Look for:
     - Base URL for API calls
     - Required URL structure
     - Example API calls

## Alternative Sandbox URLs

Worldpay might use different sandbox URLs:
- `https://try.access.worldpay.com` ✓ (currently using)
- `https://api.worldpay.com` (production)
- `https://secure.worldpay.com` (alternative)
- `https://secure-test.worldpay.com` (alternative test)

## Webhook Setup

**Note:** The error is happening during payment **creation**, not webhook processing. However, webhooks still need to be configured:

1. **Webhook URL:** `https://yourdomain.com/api/payments/worldpay/webhook`
2. **Webhook Secret:** Get from Worldpay dashboard → Settings → Webhooks
3. **Add to .env:** `WORLDPAY_WEBHOOK_SECRET=your-secret-key`

## What to Check in Worldpay Dashboard

1. **API Credentials Section:**
   - Verify the username/password are correct
   - Check if there's a merchant code or account ID needed
   - Look for API endpoint documentation

2. **Test Environment Settings:**
   - Confirm you're in test/sandbox mode
   - Check if test mode requires different endpoints
   - Verify checkout ID is valid for test environment

3. **API Access:**
   - Ensure API access is enabled for your account
   - Check if there are IP restrictions
   - Verify account is activated for test mode

## Code Changes Made

1. ✅ Updated to use checkout ID in URL path when available
2. ✅ Added detailed error logging (check server console)
3. ✅ Support for both URL formats
4. ✅ Sandbox URL configuration

**Check your server terminal/console for detailed error logs showing:**
- Exact URL being called
- Full error response from Worldpay
- Status code and response body

