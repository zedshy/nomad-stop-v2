# 💳 Payment Testing Guide (No Real Money!)

## 🧪 How to Test Without Spending Real Money

You have **two options** to test payments safely:

---

## ✅ Option 1: Use Sandbox Mode (RECOMMENDED - FREE)

### Step 1: Switch to Sandbox Mode

Run the toggle script:
```bash
./toggle-payment-mode.sh
# Select option 1 (Sandbox)
```

**OR** manually edit `.env`:
```bash
WORLDPAY_ENVIRONMENT="sandbox"  # Change from "production"
```

### Step 2: Restart Your Dev Server
```bash
npm run dev -- -p 3005
```

### Step 3: Use Test Cards (No Real Money!)

Visit: http://localhost:3005

---

## 💳 Worldpay Test Card Numbers

### ✅ Successful Payment (Approved)
```
Card Number: 4444 3333 2222 1111
Expiry Date: 12/26 (any future date)
CVV: 123
Cardholder: Test User
Postcode: Any valid UK postcode
```

### ❌ Declined Payment (Test Failures)
```
Card Number: 4444 3333 2222 1112
Expiry Date: 12/26
CVV: 123
```

### 🔄 3D Secure Test (Requires Authentication)
```
Card Number: 4444 3333 2222 1111
Expiry Date: 12/26
CVV: 123
Note: When prompted for 3D Secure, use password: "password"
```

### 💰 Different Card Types (All Free in Sandbox)

**Visa:**
```
4444 3333 2222 1111
```

**Mastercard:**
```
5555 5555 5555 4444
```

**American Express:**
```
3400 0000 0000 009
```

---

## 🧪 Test Scenarios

### 1. Test Successful Order Flow:
1. Go to http://localhost:3005/menu
2. Add items to cart
3. Go to checkout
4. Fill in delivery details
5. Use test card: `4444 3333 2222 1111`
6. Complete payment (no real money charged!)
7. Check order appears in admin panel

### 2. Test Declined Payment:
1. Go through checkout
2. Use declined card: `4444 3333 2222 1112`
3. See error message displayed correctly

### 3. Test Different Amounts:
- Order £5 worth of food
- Order £50 worth of food
- Order with delivery fee
- All charges are **fake** in sandbox mode!

---

## 🔄 Quick Mode Switching

### To Test (Sandbox):
```bash
./toggle-payment-mode.sh
# Choose option 1
npm run dev -- -p 3005
```

### To Go Live (Production):
```bash
./toggle-payment-mode.sh
# Choose option 2
# Deploy to VPS
```

---

## ✅ Option 2: Small Real Payment Test

If you want to test production mode with minimal risk:

1. Keep production mode on
2. Order the **cheapest item** on your menu (e.g., £1-2)
3. Use your **real card** (you'll pay the small amount)
4. Verify the full payment flow works
5. **Refund yourself** through Worldpay dashboard

**Note:** This costs real money (even if small), so Option 1 is better!

---

## 🎯 What Gets Tested in Sandbox Mode:

- ✅ Payment form displays correctly
- ✅ Card validation works
- ✅ Payment processing (success/failure)
- ✅ Order creation in database
- ✅ Order appears in admin panel
- ✅ Payment webhooks (if configured)
- ✅ Email notifications (if configured)
- ❌ **NO REAL MONEY IS CHARGED!**

---

## 📋 Testing Checklist

Use this checklist when testing in sandbox mode:

- [ ] Add items to cart
- [ ] Proceed to checkout
- [ ] Fill in delivery details
- [ ] Enter test card: 4444 3333 2222 1111
- [ ] Complete payment (see success page)
- [ ] Check order in admin panel
- [ ] Test declined card: 4444 3333 2222 1112
- [ ] Verify error handling works
- [ ] Test different order amounts
- [ ] Test with/without promo codes

---

## 🚨 Important Notes:

1. **Sandbox mode = FREE testing** (recommended)
2. **Production mode = REAL MONEY** (only use when ready to go live)
3. Test cards only work in **sandbox mode**
4. Your VPS is currently in **production mode** (real money)
5. Your **local dev** can be in **sandbox mode** (free testing)

---

## 🔐 Current Configuration:

### Local (.env):
```bash
# Check your current mode:
grep WORLDPAY_ENVIRONMENT .env

# Should show: "sandbox" for testing
```

### VPS (Production):
```bash
# VPS should stay in "production" mode
# Only test locally in sandbox mode
```

---

## ✅ Recommended Workflow:

1. **Test locally** in sandbox mode (free)
2. Once everything works, switch to **production**
3. Keep **VPS in production** mode
4. Keep **local in sandbox** for future testing

---

## 🎉 You're All Set!

Run `./toggle-payment-mode.sh` and start testing **for FREE**! 🚀

No real money required! 💰❌



