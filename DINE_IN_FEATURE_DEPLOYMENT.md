# Dine In & Take Away Feature - Deployment Guide

## Overview

This feature adds two prominent buttons on the homepage that allow customers to choose between:
- **🍽️ Dine In** - For customers dining at the restaurant
- **📦 Take Away** - For customers picking up their order

When customers click either button, they're taken directly to the menu with their choice pre-selected.

## What Was Changed

### 1. Database Schema
- Added `dine_in` to the `FulfilmentType` enum in Prisma schema
- Created migration file: `prisma/migrations/add_dine_in_fulfilment/migration.sql`

### 2. Frontend Components
- **VideoHero.tsx**: Updated to show two buttons (Dine In & Take Away) instead of one "View Menu" button
- **Checkout Page**: Added "Dine In" option to the fulfilment type selection
- **Cart Store**: Updated to support `dine_in` fulfilment type

### 3. Backend Logic
- **Pricing**: Updated to handle `dine_in` (no delivery fee, same as pickup)
- **Order Creation API**: Already handles `dine_in` correctly (no delivery fee)
- **Email Templates**: Updated to display "Dine In" correctly
- **Admin Page**: Updated to show Dine In orders with purple badge

## Deployment Steps

### On the VPS:

```bash
cd /var/www/nomad-stop

# 1. Pull latest code
git pull origin main

# 2. Run database migration
npx prisma migrate deploy

# 3. Generate Prisma client
npx prisma generate

# 4. Rebuild the application
npm run build:prod

# 5. Restart PM2
pm2 restart nomad-stop
```

### Alternative: If migration fails

If `prisma migrate deploy` fails, you can run the SQL directly:

```bash
cd /var/www/nomad-stop

# Connect to database and run migration
psql $DATABASE_URL -c "ALTER TYPE \"FulfilmentType\" ADD VALUE IF NOT EXISTS 'dine_in';"

# Then continue with steps 3-5 above
npx prisma generate
npm run build:prod
pm2 restart nomad-stop
```

## How It Works

1. **Homepage**: Customer sees two buttons - "Dine In" and "Take Away"
2. **Selection**: Clicking either button:
   - Sets the fulfilment type in the cart store
   - Redirects to `/menu` page
3. **Menu**: Customer browses and adds items to cart
4. **Checkout**: 
   - For "Dine In": No address required, no delivery fee
   - For "Take Away": No address required, no delivery fee
   - For "Delivery": Address required, delivery fee applies
5. **Order Processing**: Order is saved with the correct fulfilment type

## Testing

After deployment, test:
1. ✅ Click "Dine In" button on homepage → should go to menu
2. ✅ Add items to cart → checkout should show "Dine In" selected
3. ✅ Complete order → should not require address
4. ✅ Check admin page → order should show "dine_in" with purple badge
5. ✅ Check email confirmation → should say "Dine In"

## Notes

- "Dine In" and "Take Away" (pickup) both have no delivery fee
- Only "Delivery" orders require an address and have a delivery fee
- The fulfilment type is stored in the database and displayed in admin panel
- Email confirmations correctly identify the order type
