# How to Pull Latest Code

This guide shows you how to pull the latest code both locally and on your VPS.

## Step 1: Commit and Push Changes Locally

First, commit the checkout fix we just made:

```bash
# Make sure you're in the project directory
cd /Users/zeshaanqureshi/Desktop/Nomad-Stop-NextJS

# Check what files have changed
git status

# Add the changed file
git add src/app/checkout/page.tsx

# Commit the changes
git commit -m "Fix checkout step 2 progression - add missing setFulfilment and setTipPercent imports"

# Push to GitHub
git push origin main
```

---

## Step 2: Pull Latest Code on VPS

SSH into your VPS and pull the latest code:

```bash
# SSH into your VPS
ssh nomadadmin@92.205.231.55

# Navigate to project directory
cd /var/www/nomad-stop

# Check current status
git status

# Pull latest code from GitHub
git pull origin main

# If you have uncommitted changes, stash them first:
# git stash
# git pull origin main
# git stash pop
```

---

## Step 3: Install Dependencies (if needed)

If package.json changed, install dependencies:

```bash
cd /var/www/nomad-stop
npm install
```

---

## Step 4: Generate Prisma Client (if schema changed)

If Prisma schema changed, regenerate the client:

```bash
cd /var/www/nomad-stop
npx prisma generate
```

---

## Step 5: Build and Restart

Rebuild the application and restart PM2:

```bash
cd /var/www/nomad-stop

# Build the application
npm run build:prod

# Restart PM2 with new code
pm2 restart nomad-stop --update-env

# Check status
pm2 status
```

---

## Quick Command Summary

**On your local machine (after making changes):**
```bash
cd /Users/zeshaanqureshi/Desktop/Nomad-Stop-NextJS
git add .
git commit -m "Your commit message"
git push origin main
```

**On your VPS (to get latest code):**
```bash
ssh nomadadmin@92.205.231.55
cd /var/www/nomad-stop
git pull origin main
npm install  # Only if package.json changed
npx prisma generate  # Only if schema changed
npm run build:prod
pm2 restart nomad-stop --update-env
```

---

## Troubleshooting

### Error: "Your local changes would be overwritten"

If you have uncommitted changes on VPS, stash them:

```bash
git stash
git pull origin main
git stash pop
```

### Error: "Already up to date"

This means your VPS already has the latest code. No action needed!

### Error: "Permission denied"

Make sure you're in the correct directory and have permissions:

```bash
cd /var/www/nomad-stop
ls -la
```

---

## Alternative: Direct File Update

If you just want to update the checkout file directly on VPS without git:

```bash
ssh nomadadmin@92.205.231.55
cd /var/www/nomad-stop
nano src/app/checkout/page.tsx
```

Then find line 59 and change:
```typescript
const { items, getSubtotal, getDeliveryFee, getTip, getDiscount, getTotal, setCustomer, setAddress, setSlot, setPromoCode, promoCode, clear } = useCartStore();
```

To:
```typescript
const { items, getSubtotal, getDeliveryFee, getTip, getDiscount, getTotal, setCustomer, setAddress, setSlot, setPromoCode, setFulfilment, setTipPercent, promoCode, clear } = useCartStore();
```

Then rebuild:
```bash
npm run build:prod
pm2 restart nomad-stop
```




