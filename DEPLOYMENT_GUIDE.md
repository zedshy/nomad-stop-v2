# Complete Next.js Deployment Guide for GoDaddy VPS

This guide documents the complete deployment process for a Next.js application to a GoDaddy VPS with PostgreSQL database, nginx, SSL, and PM2 process management.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [VPS Initial Setup](#vps-initial-setup)
3. [Install Required Software](#install-required-software)
4. [Database Setup](#database-setup)
5. [Application Deployment](#application-deployment)
6. [Environment Variables](#environment-variables)
7. [Nginx Configuration](#nginx-configuration)
8. [DNS Configuration](#dns-configuration)
9. [SSL/HTTPS Setup](#sslhttps-setup)
10. [PM2 Process Management](#pm2-process-management)
11. [Updating Your Application](#updating-your-application)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- GoDaddy VPS with SSH access
- Domain name (optional but recommended)
- GitHub repository with your Next.js application
- Basic knowledge of Linux commands

---

## VPS Initial Setup

### Step 1: SSH into Your VPS

```bash
ssh your-username@your-vps-ip
# Example: ssh nomadadmin@92.205.231.55
```

### Step 2: Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

---

## Install Required Software

### Step 1: Install Node.js

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 2: Install Nginx

```bash
sudo apt install -y nginx

# Start and enable nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### Step 3: Install Git

```bash
sudo apt install -y git

# Verify installation
git --version
```

### Step 4: Install PM2 (Node Process Manager)

```bash
sudo npm install -g pm2

# Verify installation
pm2 --version
```

---

## Database Setup

### Option 1: Using External Database (Recommended for Production)

For this deployment, we used Neon PostgreSQL. The connection string format:

```
DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"
```

### Option 2: Install PostgreSQL Locally

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
```

```sql
CREATE DATABASE your_database_name;
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE your_database_name TO your_username;
\q
```

Then update your `DATABASE_URL`:
```
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/your_database_name"
```

---

## Application Deployment

### Step 1: Clone Your Repository

```bash
# Navigate to web directory
cd /var/www

# Clone your repository
sudo git clone https://github.com/yourusername/your-repo.git your-app-name
# Example: sudo git clone https://github.com/zedshy/nomad-stop-v2.git nomad-stop

# Set proper ownership
sudo chown -R $USER:$USER /var/www/your-app-name
cd /var/www/your-app-name
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Generate Prisma Client

```bash
npx prisma generate
```

### Step 4: Run Database Migrations

```bash
npx prisma migrate deploy
```

### Step 5: Build Application

```bash
# Production build (no Turbopack)
npm run build:prod
# or if you have build:prod script
npm run build
```

---

## Environment Variables

### Step 1: Create .env File

```bash
cd /var/www/your-app-name
nano .env
```

### Step 2: Add Required Variables

```bash
# Database
DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"
DISABLE_DB="false"

# Next.js
NODE_ENV="production"
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"

# Admin
ADMIN_PASSWORD="your-secure-password"

# Payment Gateway (Worldpay example)
WORLDPAY_USERNAME="your_username"
WORLDPAY_PASSWORD="your_password"
WORLDPAY_CHECKOUT_ID="your_checkout_id"
WORLDPAY_ENTITY_ID="your_entity_id"
WORLDPAY_ENVIRONMENT="production"
WORLDPAY_WEBHOOK_SECRET="your_webhook_secret"
NEXT_PUBLIC_WORLDPAY_CHECKOUT_ID="your_checkout_id"
NEXT_PUBLIC_WORLDPAY_ENVIRONMENT="production"
NEXT_PUBLIC_WORLDPAY_ENTITY_ID="your_entity_id"

# Email (Nodemailer example)
EMAIL_HOST="smtp.gmail.com"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-email-password"
ADMIN_EMAIL="admin@yourdomain.com"
```

### Step 3: Save and Exit

Press `Ctrl+X`, then `Y`, then `Enter`

**Important:** Never commit `.env` to Git - it should be in `.gitignore`

---

## Nginx Configuration

### Step 1: Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/your-app-name
```

### Step 2: Add Configuration (HTTP First)

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com your-vps-ip;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 3: Enable Site

```bash
# Enable site
sudo ln -sf /etc/nginx/sites-available/your-app-name /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

---

## DNS Configuration

### Step 1: Access DNS Management (GoDaddy)

1. Log in to GoDaddy: https://www.godaddy.com
2. Go to "My Products"
3. Find your domain
4. Click "DNS" or "Manage DNS"

### Step 2: Add A Record

- **Type:** `A`
- **Name:** `@` (or leave blank for root domain)
- **Data/Value:** `your-vps-ip`
- **TTL:** `600 seconds`
- Click "Save"

### Step 3: Add WWW Subdomain (Optional)

- **Type:** `A`
- **Name:** `www`
- **Data/Value:** `your-vps-ip`
- **TTL:** `600 seconds`
- Click "Save"

### Step 4: Wait for DNS Propagation

- Usually takes 15-30 minutes
- Check with: `nslookup yourdomain.com`

---

## SSL/HTTPS Setup

### Step 1: Install Certbot

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

### Step 2: Update Nginx Configuration

Make sure your nginx config includes your domain:

```nginx
server_name yourdomain.com www.yourdomain.com your-vps-ip;
```

### Step 3: Get SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts:
1. Enter your email address
2. Agree to terms (type `A`)
3. Choose to redirect HTTP to HTTPS (type `2` - recommended)

### Step 4: Verify Auto-Renewal

```bash
# Test renewal (dry run)
sudo certbot renew --dry-run

# Check renewal timer
sudo systemctl status certbot.timer
```

### Step 5: Update Environment Variables

```bash
nano .env
```

Update:
```bash
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
```

Save and restart PM2:
```bash
pm2 restart your-app-name --update-env
```

---

## PM2 Process Management

### Step 1: Create PM2 Ecosystem File

Create `ecosystem.config.js` in your project root:

```javascript
module.exports = {
  apps: [{
    name: 'your-app-name',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/var/www/your-app-name',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
  }]
};
```

### Step 2: Start Application with PM2

```bash
cd /var/www/your-app-name
pm2 start ecosystem.config.js
```

### Step 3: Save PM2 Configuration

```bash
pm2 save
pm2 startup
```

This will generate a command to run with sudo - run that command.

### Step 4: PM2 Common Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs your-app-name

# Restart app
pm2 restart your-app-name --update-env

# Stop app
pm2 stop your-app-name

# Delete app
pm2 delete your-app-name

# Monitor
pm2 monit
```

---

## Updating Your Application

### Step 1: Pull Latest Code

```bash
cd /var/www/your-app-name
git pull origin main
```

### Step 2: Install Dependencies (if needed)

```bash
npm install
```

### Step 3: Generate Prisma Client (if schema changed)

```bash
npx prisma generate
```

### Step 4: Run Migrations (if database changed)

```bash
npx prisma migrate deploy
```

### Step 5: Rebuild Application

```bash
npm run build:prod
```

### Step 6: Restart PM2

```bash
pm2 restart your-app-name --update-env
```

### Quick Update Script

Create `update.sh`:

```bash
#!/bin/bash
cd /var/www/your-app-name
git pull origin main
npm install
npx prisma generate
npx prisma migrate deploy
npm run build:prod
pm2 restart your-app-name --update-env
pm2 status
```

Make it executable:
```bash
chmod +x update.sh
```

Run updates:
```bash
./update.sh
```

---

## Troubleshooting

### Issue: Application Won't Start

**Check PM2 logs:**
```bash
pm2 logs your-app-name
```

**Check if port 3000 is in use:**
```bash
sudo netstat -tuln | grep 3000
```

**Check environment variables:**
```bash
cd /var/www/your-app-name
cat .env | grep -v PASSWORD
```

### Issue: Database Connection Failed

**Check DATABASE_URL format:**
```bash
cat .env | grep DATABASE_URL
```

Should be:
```
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

**Test database connection:**
```bash
npx prisma migrate status
```

**Check Prisma client:**
```bash
npx prisma generate
```

### Issue: 502 Bad Gateway

**Check if app is running:**
```bash
pm2 status
curl http://localhost:3000
```

**Check nginx logs:**
```bash
sudo tail -f /var/log/nginx/error.log
```

**Check nginx configuration:**
```bash
sudo nginx -t
```

**Restart services:**
```bash
pm2 restart your-app-name
sudo systemctl restart nginx
```

### Issue: Domain Not Resolving

**Check DNS:**
```bash
nslookup yourdomain.com
dig yourdomain.com
```

Should return your VPS IP address.

**Wait for DNS propagation** (can take up to 48 hours, usually 15-30 minutes)

### Issue: SSL Certificate Not Working

**Check certificate:**
```bash
sudo certbot certificates
```

**Test renewal:**
```bash
sudo certbot renew --dry-run
```

**Check if port 443 is open:**
```bash
sudo ufw status
sudo ufw allow 443/tcp
```

**Check nginx SSL config:**
```bash
sudo cat /etc/nginx/sites-available/your-app-name
```

Should include SSL certificates automatically added by Certbot.

### Issue: Environment Variables Not Loading

**Restart PM2 with --update-env:**
```bash
pm2 restart your-app-name --update-env
```

**Check .env file exists:**
```bash
ls -la .env
```

**Verify variables are loaded:**
```bash
pm2 logs your-app-name | grep -i env
```

### Issue: Build Fails

**Clear .next directory:**
```bash
rm -rf .next
npm run build:prod
```

**Check for TypeScript errors:**
```bash
npm run build 2>&1 | grep -i error
```

**Check Prisma:**
```bash
npx prisma generate
npx prisma migrate deploy
```

---

## Security Best Practices

### 1. Firewall Configuration

```bash
# Install UFW if not installed
sudo apt install -y ufw

# Allow SSH
sudo ufw allow ssh

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 2. Keep System Updated

```bash
sudo apt update
sudo apt upgrade -y
```

### 3. Secure .env File

```bash
# Set proper permissions
chmod 600 .env

# Never commit .env to Git
# Check .gitignore includes .env
```

### 4. Regular Backups

**Database backups:**
```bash
# For PostgreSQL
pg_dump -U username database_name > backup.sql

# For external databases, use their backup features
```

**Application backups:**
```bash
# Backup entire application
tar -czf backup-$(date +%Y%m%d).tar.gz /var/www/your-app-name
```

---

## Monitoring and Maintenance

### Check Application Status

```bash
# PM2 status
pm2 status

# System resources
htop
# or
top

# Disk space
df -h

# Memory usage
free -h
```

### Log Monitoring

```bash
# Application logs
pm2 logs your-app-name

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx
sudo journalctl -u pm2
```

---

## Quick Reference Commands

```bash
# Navigate to app directory
cd /var/www/your-app-name

# Pull latest code
git pull origin main

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build application
npm run build:prod

# Restart application
pm2 restart your-app-name --update-env

# Check status
pm2 status

# View logs
pm2 logs your-app-name

# Test nginx
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# Check SSL certificates
sudo certbot certificates

# Update SSL certificates
sudo certbot renew
```

---

## File Structure Reference

```
/var/www/your-app-name/
├── .env                 # Environment variables (not in git)
├── .next/              # Next.js build output
├── node_modules/       # Dependencies
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── migrations/     # Database migrations
├── src/                # Source code
├── public/             # Static files
├── ecosystem.config.js # PM2 configuration
├── package.json        # Node.js dependencies
└── next.config.ts      # Next.js configuration
```

---

## Checklist for New Deployment

- [ ] VPS provisioned and accessible via SSH
- [ ] Node.js installed (v20.x or later)
- [ ] Nginx installed and configured
- [ ] Git installed
- [ ] PM2 installed globally
- [ ] Application cloned from GitHub
- [ ] Dependencies installed (`npm install`)
- [ ] Database connection configured
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Database migrations run (`npx prisma migrate deploy`)
- [ ] Environment variables set in `.env`
- [ ] Application built (`npm run build:prod`)
- [ ] PM2 process started
- [ ] Nginx configured and tested
- [ ] DNS records configured
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Backups scheduled
- [ ] Monitoring set up

---

## Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt / Certbot Documentation](https://certbot.eff.org/)
- [Prisma Documentation](https://www.prisma.io/docs/)

---

## Notes

- Always test changes on a staging environment first
- Keep backups of your database and application
- Monitor logs regularly for errors
- Keep dependencies updated for security
- Review PM2 logs after deployments
- Test SSL certificate renewal periodically
- Document any custom configurations

---

**Last Updated:** Based on successful deployment experience with Next.js 15, PostgreSQL, GoDaddy VPS, and nginx.




