# ✅ Production Deployment - Quick Checklist

## 📋 Pre-Deployment Checklist

### 1. Database Setup
- [ ] PostgreSQL installed on VPS
- [ ] Database created: `nomadstop`
- [ ] Database user created with password
- [ ] DATABASE_URL added to .env

### 2. Environment Variables (.env file)
```bash
# Required Variables:
DISABLE_DB=false
DATABASE_URL="postgresql://..."
ADMIN_PASSWORD="secure_password_here"
WORLDPAY_USERNAME="lIqCHi2DjIYm7J9Y"
WORLDPAY_PASSWORD="KAYkMF0LG9VEASNXkzwDgMKbsYxBW5dtAuJoLsZVc4RG0CC2iBd4ZF4xF2BoWnRT"
WORLDPAY_ENVIRONMENT="production"
WORLDPAY_WEBHOOK_SECRET="from_worldpay_dashboard"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your@email.com"
EMAIL_PASS="app_password"
EMAIL_FROM="Nomad Stop <noreply@nomadstop.com>"
NEXT_PUBLIC_BASE_URL="https://www.nomadstop.com"
NODE_ENV="production"
```

### 3. Worldpay Configuration
- [ ] Login to Worldpay Merchant Console
- [ ] Add webhook URL: `https://www.nomadstop.com/api/payments/worldpay/webhook`
- [ ] Select events: PAYMENT_AUTHORIZED, PAYMENT_CAPTURED, PAYMENT_CANCELLED, PAYMENT_FAILED
- [ ] Copy webhook secret key
- [ ] Add WORLDPAY_WEBHOOK_SECRET to .env

### 4. Email Configuration (Gmail Example)
- [ ] Enable 2-Factor Authentication on Gmail
- [ ] Generate App Password (Google Account → Security → App Passwords)
- [ ] Add EMAIL_USER and EMAIL_PASS to .env

---

## 🚀 Deployment Commands

### On Your VPS:

```bash
# 1. Navigate to project directory
cd /var/www/nomad-stop

# 2. Pull latest code
git pull origin main

# 3. Make deployment script executable
chmod +x deploy-production.sh

# 4. Run deployment
./deploy-production.sh
```

### Or Manual Deployment:

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build application
npm run build:prod

# Start with PM2
pm2 start npm --name "nomad-stop" -- start
pm2 save
```

---

## ✅ Post-Deployment Verification

### 1. Check Application is Running
```bash
pm2 status nomad-stop
# Should show status: online ✓
```

### 2. Test Admin Login
- URL: `https://www.nomadstop.com/admin`
- Username: `admin`
- Password: (from ADMIN_PASSWORD in .env)
- [ ] Successfully logged in

### 3. Test Database Connection
```bash
npx prisma studio
# Should open Prisma Studio ✓
```

### 4. Test Order Flow
- [ ] Place test order on website
- [ ] Payment processes successfully
- [ ] Order appears in admin panel
- [ ] Customer receives confirmation email

### 5. Check Logs
```bash
pm2 logs nomad-stop
# Should show no errors ✓
```

---

## 🔧 Common Issues & Quick Fixes

### Issue: Admin login not working
```bash
# Check admin password is set
grep ADMIN_PASSWORD .env

# Restart application
pm2 restart nomad-stop
```

### Issue: Payment not processing
```bash
# Check Worldpay credentials
grep WORLDPAY .env

# Verify webhook secret
grep WORLDPAY_WEBHOOK_SECRET .env

# Check webhook is accessible
curl https://www.nomadstop.com/api/payments/worldpay/webhook
```

### Issue: Database connection error
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test database connection
psql "$(grep DATABASE_URL .env | cut -d '=' -f2)"
```

### Issue: Email not sending
```bash
# Verify email configuration
grep EMAIL .env

# Check for email errors in logs
pm2 logs nomad-stop | grep -i email
```

---

## 📊 Important URLs

- **Website**: https://www.nomadstop.com
- **Admin Panel**: https://www.nomadstop.com/admin
- **Webhook**: https://www.nomadstop.com/api/payments/worldpay/webhook
- **Worldpay Console**: https://online.worldpay.com

---

## 🔒 Security Checklist

- [ ] Changed default ADMIN_PASSWORD to strong password
- [ ] .env file permissions set to 600 (`chmod 600 .env`)
- [ ] SSL certificate installed (HTTPS enabled)
- [ ] Firewall configured (allow 22, 80, 443)
- [ ] Regular database backups scheduled

---

## 📝 Maintenance Commands

```bash
# View logs
pm2 logs nomad-stop

# Restart app
pm2 restart nomad-stop

# Stop app
pm2 stop nomad-stop

# Check status
pm2 status

# Monitor resources
pm2 monit

# Database backup
pg_dump nomadstop > backup_$(date +%Y%m%d).sql

# Restore database
psql nomadstop < backup_20241127.sql
```

---

## 🎯 Admin Panel Features

Once logged in to `/admin`, you can:
- ✅ View and manage all orders
- ✅ Accept/reject orders
- ✅ Add/edit/delete products
- ✅ Create promo codes
- ✅ Manage admin users
- ✅ View order statistics
- ✅ Change admin password

---

## 📞 Need Help?

1. Check logs: `pm2 logs nomad-stop`
2. Review: `PRODUCTION_ENV_SETUP.md` (detailed guide)
3. Check: `ADMIN_FUNCTIONALITY_CHECKLIST.md`
4. Verify: `docs/payments/WORLDPAY_CONFIGURATION.md`

---

## 🎉 You're Ready!

Once all checkboxes above are checked, your Nomad Stop website is fully operational in production!

**Test the complete flow:**
1. Customer places order → 
2. Payment processed →
3. Order appears in admin →
4. Admin accepts order →
5. Customer receives email confirmation ✓



