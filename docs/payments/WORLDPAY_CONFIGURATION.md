# Worldpay Configuration Checklist

## ✅ Currently Configured

1. **API Credentials** (Used in code):
   - `WORLDPAY_USERNAME=lIqCHi2DjIYm7J9Y` ✓
   - `WORLDPAY_PASSWORD=KAYkMF0LG9VEASNXkzwDgMKbsYxBW5dtAuJoLsZVc4RG0CC2iBd4ZF4xF2BoWnRT` ✓

## ❌ Missing Configuration

### 1. Webhook Secret Key (CRITICAL)
**Status:** Not configured - webhook verification is currently disabled

**What you need:**
- Obtain webhook secret key from Worldpay dashboard
- Add to `.env`: `WORLDPAY_WEBHOOK_SECRET=your-webhook-secret-key`

**Where to find it:**
1. Log into Worldpay Merchant Console
2. Navigate to Settings → Webhooks
3. Generate or copy your webhook secret key

**Current Implementation:**
- Location: `src/lib/worldpay.ts` line 389-394
- Currently: Only checks if signature exists (not secure)
- Needs: Proper HMAC signature verification

---

### 2. Webhook URL Configuration
**Status:** Needs to be configured in Worldpay dashboard

**Your Webhook Endpoint:**
```
https://yourdomain.com/api/payments/worldpay/webhook
```
(For local testing: Use ngrok or similar tunneling service)

**Configuration Steps:**
1. Log into Worldpay Merchant Console
2. Go to Settings → Webhooks
3. Add webhook URL: `https://yourdomain.com/api/payments/worldpay/webhook`
4. Select events to listen for:
   - `PAYMENT_AUTHORIZED`
   - `PAYMENT_CAPTURED`
   - `PAYMENT_CANCELLED`
   - `PAYMENT_FAILED`
5. Save webhook secret key (see #1 above)

---

### 3. Environment Configuration
**Status:** Hardcoded to production

**What's needed:**
Add to `.env`:
```env
WORLDPAY_ENVIRONMENT=production
# or
WORLDPAY_ENVIRONMENT=sandbox
```

**Current Behavior:**
- Code uses: `https://api.worldpay.com/v1/orders` (production)
- Sandbox URL would be: `https://try.access.worldpay.com/v1/orders`

**Code Location:**
- `src/lib/worldpay.ts` line 70 (hardcoded production URL)

---

### 4. Unused Configuration Variables
**Status:** Present in `.env` but not used in code

These variables exist in `.env` but are **NOT** used by the current implementation:
- `WORLDPAY_CLIENT_KEY` - Not used
- `WORLDPAY_API_KEY` - Not used  
- `WORLDPAY_CHECKOUT_ID` - Not used

**Note:** These appear to be for Worldpay's Checkout.js (frontend solution), but your code uses Worldpay's REST API directly.

---

## 📋 Action Items

### Immediate Priority:
1. ✅ Get webhook secret key from Worldpay dashboard
2. ✅ Add `WORLDPAY_WEBHOOK_SECRET` to `.env`
3. ✅ Configure webhook URL in Worldpay dashboard
4. ⚠️ Update webhook signature verification in `src/lib/worldpay.ts`

### Secondary:
5. ⚠️ Add environment variable for sandbox/production switching
6. ⚠️ Consider removing unused variables (CLIENT_KEY, API_KEY, CHECKOUT_ID)

---

## 🔧 Code Updates Needed

### 1. Update Webhook Verification (`src/lib/worldpay.ts`)

**Current (Line 389-394):**
```typescript
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  // In a real implementation, you'd verify the signature using Worldpay's method
  // For now, we'll just check if the signature exists
  return Boolean(signature && signature.length > 0);
}
```

**Needs to be:**
```typescript
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const WORLDPAY_WEBHOOK_SECRET = process.env.WORLDPAY_WEBHOOK_SECRET || '';
  
  if (!WORLDPAY_WEBHOOK_SECRET || !signature) {
    return false;
  }
  
  // Worldpay uses HMAC SHA256 for webhook signatures
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', WORLDPAY_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  // Compare signatures (use constant-time comparison)
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### 2. Add Environment-Based URL Selection

Update `src/lib/worldpay.ts` to support sandbox:
```typescript
const WORLDPAY_ENV = process.env.WORLDPAY_ENVIRONMENT || 'production';
const WORLDPAY_API_URL = WORLDPAY_ENV === 'sandbox' 
  ? 'https://try.access.worldpay.com/v1/orders'
  : 'https://api.worldpay.com/v1/orders';
```

---

## 📞 Where to Find Worldpay Settings

1. **Webhook Secret Key:**
   - Worldpay Merchant Console → Settings → Webhooks → Secret Key

2. **Webhook URL Configuration:**
   - Worldpay Merchant Console → Settings → Webhooks → Add Webhook

3. **API Credentials:**
   - Worldpay Merchant Console → Settings → API Credentials
   - (You already have these)

---

## ⚠️ Security Notes

1. **Never commit `.env` file to git** (already in `.gitignore` ✓)
2. **Webhook verification is critical** - without it, anyone can send fake webhooks
3. **Use HTTPS only** for webhook endpoints in production
4. **Rotate credentials** if compromised

---

## 🧪 Testing Checklist

- [ ] API credentials work (test payment)
- [ ] Webhook secret configured
- [ ] Webhook URL accessible from internet
- [ ] Webhook signature verification works
- [ ] Webhook receives and processes events correctly

