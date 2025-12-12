# Production Environment Setup Guide

## 📋 Complete .env Configuration for Production

Create a `.env` file on your VPS with the following variables:

```bash
# ============================================
# DATABASE CONFIGURATION
# ============================================
# Set to false to enable database
DISABLE_DB=false

# PostgreSQL connection string
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL="postgresql://your_db_user:your_db_password@localhost:5432/nomadstop?schema=public"

# ============================================
# ADMIN CONFIGURATION
# ============================================
# Default admin password for login
# IMPORTANT: Change this to a strong password!
ADMIN_PASSWORD="your_secure_admin_password_here"

# ============================================
# WORLDPAY PAYMENT CONFIGURATION
# ============================================
# API Credentials (You already have these)
WORLDPAY_USERNAME="lIqCHi2DjIYm7J9Y"
WORLDPAY_PASSWORD="KAYkMF0LG9VEASNXkzwDgMKbsYxBW5dtAuJoLsZVc4RG0CC2iBd4ZF4xF2BoWnRT"

# Environment: production or sandbox
WORLDPAY_ENVIRONMENT="production"

# Entity ID (if required by Worldpay)
WORLDPAY_ENTITY_ID="your_entity_id_if_needed"

# Checkout ID (if using Worldpay Checkout.js)
WORLDPAY_CHECKOUT_ID="your_checkout_id_if_needed"

# CRITICAL: Webhook Secret Key
# Get this from Worldpay Merchant Console → Settings → Webhooks
WORLDPAY_WEBHOOK_SECRET="your_webhook_secret_key_here"

# ============================================
# EMAIL CONFIGURATION
# ============================================
# Email service for order confirmations
# Example using Gmail:
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-specific-password"
EMAIL_FROM="Nomad Stop <noreply@nomadstop.com>"

# ============================================
# APPLICATION CONFIGURATION
# ============================================
# Your production domain
NEXT_PUBLIC_BASE_URL="https://www.nomadstop.com"

# Node environment
NODE_ENV="production"
```

---

## 🚀 Step-by-Step Production Deployment

### Step 1: Create Production Database

```bash
# On your VPS, install PostgreSQL if not already installed
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql

# In PostgreSQL console:
CREATE DATABASE nomadstop;
CREATE USER nomadstop_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE nomadstop TO nomadstop_user;
\q
```

### Step 2: Set Up Environment Variables

```bash
# On your VPS, navigate to your app directory
cd /var/www/nomad-stop

# Create .env file
nano .env

# Paste the environment variables from above
# Save and exit (Ctrl+X, then Y, then Enter)

# Secure the .env file
chmod 600 .env
```

### Step 3: Run Database Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations to create all tables
npx prisma migrate deploy

# Verify tables were created
npx prisma db push
```

### Step 4: Create First Admin User

```bash
# Option 1: Use the default ADMIN_PASSWORD from .env
# Login at: https://www.nomadstop.com/admin
# Username: admin
# Password: (value from ADMIN_PASSWORD in .env)

# Option 2: Create admin user via database
npx prisma studio
# Then manually create an admin user
```

### Step 5: Configure Worldpay Webhooks

1. **Log into Worldpay Merchant Console**
   - Go to: https://online.worldpay.com

2. **Navigate to Webhooks**
   - Settings → Webhooks → Add Webhook

3. **Configure Webhook URL**
   ```
   https://www.nomadstop.com/api/payments/worldpay/webhook
   ```

4. **Select Events to Monitor**
   - ✅ PAYMENT_AUTHORIZED
   - ✅ PAYMENT_CAPTURED  
   - ✅ PAYMENT_CANCELLED
   - ✅ PAYMENT_FAILED

5. **Copy Webhook Secret Key**
   - Copy the secret key provided
   - Add to your `.env`: `WORLDPAY_WEBHOOK_SECRET="..."`

### Step 6: Configure Email for Order Confirmations

#### Using Gmail:
```bash
1. Enable 2-Factor Authentication on your Gmail account
2. Generate App Password:
   - Google Account → Security → 2-Step Verification → App Passwords
   - Select "Mail" and "Other (Custom name)"
   - Copy the generated password

3. Add to .env:
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT="587"
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASS="generated-app-password"
```

#### Using Other Email Providers:
```bash
# SendGrid
EMAIL_HOST="smtp.sendgrid.net"
EMAIL_PORT="587"
EMAIL_USER="apikey"
EMAIL_PASS="your-sendgrid-api-key"

# Mailgun
EMAIL_HOST="smtp.mailgun.org"
EMAIL_PORT="587"
EMAIL_USER="postmaster@your-domain.mailgun.org"
EMAIL_PASS="your-mailgun-smtp-password"
```

### Step 7: Build and Start Application

```bash
# Install dependencies
npm install

# Build for production
npm run build:prod

# Start the application
npm start

# Or with PM2 for process management:
pm2 start npm --name "nomad-stop" -- start
pm2 save
pm2 startup
```

---

## ✅ Verification Checklist

### 1. Database Connection
```bash
# Test database connection
npx prisma studio

# Should open Prisma Studio in browser
# If successful, database is connected ✓
```

### 2. Admin Login
```bash
# Visit: https://www.nomadstop.com/admin
# Username: admin
# Password: (from ADMIN_PASSWORD in .env)

# Should successfully login ✓
```

### 3. Payment Processing
```bash
# Make a test order on your website
# Complete payment with test card:
#   Card: 4444 3333 2222 1111
#   CVV: 123
#   Expiry: Any future date

# Check order appears in admin panel ✓
```

### 4. Email Sending
```bash
# From admin panel, accept an order
# Customer should receive confirmation email ✓
```

### 5. Webhook Reception
```bash
# Check server logs for webhook events:
tail -f /var/www/nomad-stop/logs/app.log

# Should see webhook POST requests ✓
```

---

## 🔒 Security Best Practices

### 1. Strong Passwords
```bash
# Generate strong admin password:
openssl rand -base64 32

# Add to .env as ADMIN_PASSWORD
```

### 2. File Permissions
```bash
# Secure .env file
chmod 600 .env

# Ensure only owner can access
chown www-data:www-data .env
```

### 3. SSL/HTTPS
```bash
# Install Certbot for Let's Encrypt SSL
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d www.nomadstop.com -d nomadstop.com
```

### 4. Firewall Configuration
```bash
# Allow only necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

---

## 🧪 Testing Commands

```bash
# Test database connection
npx prisma db pull

# Test admin API
curl http://localhost:3000/api/admin/products

# Test payment API
curl http://localhost:3000/api/payments/worldpay/webhook \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Check application logs
pm2 logs nomad-stop

# Monitor application
pm2 monit
```

---

## 🐛 Troubleshooting

### Admin Login Not Working
```bash
# Check ADMIN_PASSWORD is set
cat .env | grep ADMIN_PASSWORD

# Check database connection
npx prisma studio

# Create admin user manually if needed
```

### Payment Not Processing
```bash
# Verify Worldpay credentials
cat .env | grep WORLDPAY

# Check webhook secret is set
cat .env | grep WORLDPAY_WEBHOOK_SECRET

# Test webhook endpoint is accessible
curl https://www.nomadstop.com/api/payments/worldpay/webhook
```

### Email Not Sending
```bash
# Verify email configuration
cat .env | grep EMAIL

# Test SMTP connection
telnet smtp.gmail.com 587
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify DATABASE_URL format
cat .env | grep DATABASE_URL

# Test connection manually
psql "postgresql://user:pass@localhost:5432/nomadstop"
```

---

## 📝 Quick Reference

### Important URLs
- **Website**: https://www.nomadstop.com
- **Admin Panel**: https://www.nomadstop.com/admin
- **Webhook Endpoint**: https://www.nomadstop.com/api/payments/worldpay/webhook

### Important Commands
```bash
# Restart app
pm2 restart nomad-stop

# View logs
pm2 logs nomad-stop

# Check status
pm2 status

# Database migrations
npx prisma migrate deploy

# Regenerate Prisma Client
npx prisma generate
```

### Default Login
- **Username**: admin (or create via admin panel)
- **Password**: (value from ADMIN_PASSWORD in .env)

---

## 🎯 Next Steps After Deployment

1. ✅ Change default ADMIN_PASSWORD to something secure
2. ✅ Create additional admin users via Admin Panel
3. ✅ Test complete order flow (order → payment → email)
4. ✅ Monitor logs for any errors
5. ✅ Set up automated backups for database
6. ✅ Configure monitoring/alerts

---

## 📞 Support

If you encounter issues:
1. Check application logs: `pm2 logs nomad-stop`
2. Check system logs: `tail -f /var/log/nginx/error.log`
3. Verify all environment variables are set correctly
4. Ensure database is running and accessible



