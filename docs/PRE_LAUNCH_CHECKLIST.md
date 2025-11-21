# Pre-Launch Checklist for Nomad Stop

**Status:** 🟡 Ready for final checks before production deployment

---

## 🔴 CRITICAL - Must Fix Before Launch

### 1. ✅ Fixed: Syntax Error in `mailer.ts`
- **Status:** FIXED - Removed stray "u" character
- **Action:** Already completed

### 2. Database Connection
- **Status:** ⚠️ Currently using `DISABLE_DB="true"` for local testing
- **Action Required:**
  - Remove `DISABLE_DB` from production `.env`
  - Verify PostgreSQL connection string is correct
  - Test database connection on VPS
  - Ensure Prisma migrations are applied: `npx prisma migrate deploy`

### 3. Worldpay Production Credentials
- **Status:** ⚠️ Currently using sandbox/test credentials
- **Action Required:**
  - Switch `WORLDPAY_ENVIRONMENT` from `"sandbox"` to `"production"` (or remove, defaults to production)
  - Update `.env` with production credentials:
    - `WORLDPAY_USERNAME` (production)
    - `WORLDPAY_PASSWORD` (production)
    - `WORLDPAY_ENTITY_ID` (production)
    - `WORLDPAY_CHECKOUT_ID` (production, if needed)
  - Verify production API URL: `https://access.worldpay.com/payments/authorizations`

---

## 🟡 IMPORTANT - Should Complete Before Launch

### 4. Environment Variables Setup
**Required for Production:**

```bash
# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@[YOUR_VPS_IP_OR_DOMAIN]:5432/nomadstop?sslmode=prefer"

# Worldpay (Production)
WORLDPAY_USERNAME="[PRODUCTION_USERNAME]"
WORLDPAY_PASSWORD="[PRODUCTION_PASSWORD]"
WORLDPAY_ENTITY_ID="[PRODUCTION_ENTITY_ID]"
WORLDPAY_ENVIRONMENT="production"  # or remove (defaults to production)
WORLDPAY_WEBHOOK_SECRET="[PRODUCTION_WEBHOOK_SECRET]"

# Email (SMTP)
EMAIL_HOST="[SMTP_HOST]"
EMAIL_USER="[SMTP_USER]"
EMAIL_PASS="[SMTP_PASSWORD]"
ADMIN_EMAIL="[ADMIN_EMAIL_ADDRESS]"

# Application
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
NODE_ENV="production"
```

### 5. Database Seeding
- **Status:** ⚠️ Need to verify
- **Action Required:**
  - Run `npm run seed` to populate menu items
  - Verify products, variants, and addons are in database
  - Check admin can see menu items in dashboard

### 6. Email Configuration
- **Status:** ⚠️ Need SMTP credentials
- **Action Required:**
  - Set up SMTP service (Gmail, SendGrid, Resend, etc.)
  - Configure `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`
  - Test order confirmation emails
  - Test kitchen ticket emails
  - Test admin notification emails

### 7. Worldpay Webhook Configuration
- **Status:** ⚠️ Need production webhook URL
- **Action Required:**
  - Configure webhook endpoint in Worldpay dashboard:
    - URL: `https://yourdomain.com/api/worldpay/webhook`
    - Events: Payment status changes
  - Set `WORLDPAY_WEBHOOK_SECRET` in production `.env`
  - Test webhook signature verification

### 8. Production Build Test
- **Status:** ⚠️ Need to verify
- **Action Required:**
  ```bash
  npm run build
  ```
  - Should compile without errors
  - Check for any TypeScript/ESLint errors
  - Verify all routes are accessible

---

## 🟢 RECOMMENDED - Best Practices

### 9. Security Checks
- [ ] Verify all API keys are in `.env` (not hardcoded)
- [ ] Ensure `.env` is in `.gitignore`
- [ ] Check SSL certificate is valid on production domain
- [ ] Verify CORS settings if needed
- [ ] Review admin authentication

### 10. Performance Optimization
- [ ] Enable Next.js production optimizations
- [ ] Verify image optimization is working
- [ ] Check database query performance
- [ ] Test page load times

### 11. Testing Checklist
- [ ] Test complete order flow (cart → checkout → payment → confirmation)
- [ ] Test pickup orders
- [ ] Test delivery orders
- [ ] Test promo code application
- [ ] Test admin order acceptance/rejection
- [ ] Test email notifications
- [ ] Test payment capture/void (if needed)
- [ ] Test on mobile devices
- [ ] Test on different browsers

### 12. VPS Deployment Setup
- [ ] SSH into VPS
- [ ] Install Node.js (v20+)
- [ ] Clone repository
- [ ] Install dependencies: `npm install`
- [ ] Set up production `.env` file
- [ ] Run Prisma migrations: `npx prisma migrate deploy`
- [ ] Seed database: `npm run seed`
- [ ] Build application: `npm run build`
- [ ] Set up PM2: `pm2 start npm --name nomad-stop -- start`
- [ ] Configure Nginx reverse proxy
- [ ] Set up SSL certificate (Let's Encrypt)
- [ ] Configure domain DNS

### 13. Monitoring & Logging
- [ ] Set up PM2 logs: `pm2 logs nomad-stop`
- [ ] Configure error tracking (optional: Sentry)
- [ ] Set up uptime monitoring
- [ ] Configure backup strategy for database

---

## 📋 Quick Launch Commands

### On VPS:
```bash
# 1. Navigate to project
cd /var/www/nomad-stop  # or your project path

# 2. Pull latest code
git pull origin main

# 3. Install dependencies
npm install

# 4. Set up environment
# Edit .env with production values

# 5. Database setup
npx prisma migrate deploy
npm run seed

# 6. Build
npm run build

# 7. Start with PM2
pm2 restart nomad-stop --update-env
# or
pm2 start npm --name nomad-stop -- start

# 8. Check status
pm2 status
pm2 logs nomad-stop
```

---

## 🚨 Emergency Rollback Plan

If something goes wrong:
1. Stop PM2: `pm2 stop nomad-stop`
2. Revert to previous build: `git checkout [previous-commit]`
3. Rebuild: `npm run build`
4. Restart: `pm2 restart nomad-stop`

---

## 📞 Support Contacts

- **Worldpay Support:** [Contact for production credentials]
- **PostgreSQL on VPS:** Connect using standard PostgreSQL connection string
- **VPS Provider:** GoDaddy

---

**Last Updated:** $(date)
**Ready for Launch:** ⚠️ After completing Critical items (1-3)

