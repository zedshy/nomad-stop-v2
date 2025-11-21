# Deployment Guide - Nomad Stop to GoDaddy VPS

This guide covers deploying the Nomad Stop Next.js application to a GoDaddy VPS while using Neon PostgreSQL as the database.

## Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐
│  GoDaddy VPS    │────────▶│  Neon PostgreSQL │
│  (Next.js App)  │         │  (Database)      │
└─────────────────┘         └──────────────────┘
```

- **Application**: Hosted on GoDaddy VPS
- **Database**: Hosted on Neon (cloud PostgreSQL)
- **Connection**: VPS connects to Neon over the internet

## Prerequisites

- GoDaddy VPS with Ubuntu/Debian
- SSH access to VPS
- Node.js installed on VPS (v18+)
- Neon PostgreSQL database (already set up)
- Domain name pointing to VPS (optional)

## Deployment Steps

### 1. Prepare Your Code

```bash
# On your local machine
cd /path/to/Nomad-Stop-NextJS

# Ensure .env.production has the correct DATABASE_URL
# Copy your Neon connection string to .env.production
```

### 2. Build the Application

```bash
# Build for production
npm run build

# This creates the .next folder with optimized production build
```

### 3. Transfer Files to VPS

```bash
# Option A: Using SCP
scp -r .next package.json package-lock.json node_modules .env.production user@your-vps-ip:/var/www/nomad-stop/

# Option B: Using Git (recommended)
# Push to GitHub, then on VPS:
git clone https://github.com/your-username/nomad-stop-js.git
cd nomad-stop-js
```

### 4. Set Up Environment Variables on VPS

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Navigate to project directory
cd /var/www/nomad-stop

# Create .env file with production variables
nano .env
```

**Required Environment Variables:**

```bash
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://neondb_owner:password@ep-wandering-base-abtz4yht-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
DISABLE_DB="false"

# Next.js
NODE_ENV="production"
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"

# Worldpay (Production credentials)
WORLDPAY_USERNAME="your_production_username"
WORLDPAY_PASSWORD="your_production_password"
WORLDPAY_CHECKOUT_ID="your_production_checkout_id"
WORLDPAY_ENTITY_ID="your_production_entity_id"
WORLDPAY_ENVIRONMENT="production"
WORLDPAY_WEBHOOK_SECRET="your_production_webhook_secret"

# Email (Resend)
RESEND_API_KEY="your_resend_api_key"

# Admin
ADMIN_PASSWORD="your_secure_admin_password"
```

### 5. Install Dependencies on VPS

```bash
# Install Node.js dependencies
npm install --production

# Generate Prisma Client
npx prisma generate

# Run database migrations (if needed)
npx prisma migrate deploy

# Seed database (optional - only if starting fresh)
npm run seed
```

### 6. Set Up PM2 Process Manager

```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem.config.js (already in project)
# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
```

### 7. Configure Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt update
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/nomad-stop
```

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

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

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/nomad-stop /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 8. Set Up SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot will automatically configure Nginx for HTTPS
```

### 9. Configure Firewall

```bash
# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

## Using Neon Database with VPS

### Benefits

1. **No Database Installation Needed**
   - No need to install PostgreSQL on VPS
   - No database maintenance required
   - Neon handles all database operations

2. **Reliability**
   - Neon provides automatic backups
   - Better uptime than self-hosted database
   - Automatic scaling if needed

3. **Security**
   - Database is separate from application
   - SSL connections by default
   - Neon handles security updates

4. **Cost-Effective**
   - Neon free tier is generous
   - No VPS resources used for database
   - Pay only for what you use

### Connection String

Use the same Neon connection string on your VPS:

```bash
DATABASE_URL="postgresql://neondb_owner:password@ep-wandering-base-abtz4yht-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
```

### Network Considerations

- **No Firewall Changes Needed**: Neon accepts connections from anywhere
- **SSL Required**: Neon requires SSL connections (already in connection string)
- **Connection Pooling**: Neon's pooler handles multiple connections efficiently

## Monitoring and Maintenance

### Check Application Status

```bash
# PM2 status
pm2 status

# PM2 logs
pm2 logs nomad-stop

# Restart application
pm2 restart nomad-stop
```

### Check Database Connection

```bash
# Test connection from VPS
npx prisma db pull
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Install new dependencies
npm install

# Rebuild
npm run build

# Restart PM2
pm2 restart nomad-stop
```

## Troubleshooting

### Application Won't Start

1. Check PM2 logs: `pm2 logs nomad-stop`
2. Verify environment variables: `cat .env`
3. Check database connection: `npx prisma db pull`
4. Verify Node.js version: `node -v` (should be v18+)

### Database Connection Issues

1. Verify DATABASE_URL in .env
2. Test connection: `npx prisma db pull`
3. Check Neon dashboard for connection limits
4. Verify SSL is enabled in connection string

### Nginx Issues

1. Test configuration: `sudo nginx -t`
2. Check error logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify proxy_pass points to correct port (3000)

## Security Checklist

- [ ] Use strong passwords for admin accounts
- [ ] Keep .env file secure (not in Git)
- [ ] Enable firewall on VPS
- [ ] Use SSL/HTTPS (Let's Encrypt)
- [ ] Regularly update system packages
- [ ] Monitor PM2 logs for errors
- [ ] Set up automated backups (Neon handles DB backups)

## Backup Strategy

- **Database**: Neon provides automatic daily backups
- **Application Code**: Use Git repository
- **Environment Variables**: Store securely (password manager)
- **Media Files**: If storing uploads, set up separate backup

## Performance Optimization

1. **Enable PM2 Clustering** (if needed):
   ```bash
   pm2 start ecosystem.config.js -i max
   ```

2. **Monitor Resource Usage**:
   ```bash
   pm2 monit
   ```

3. **Database Indexing**: Already handled by Prisma migrations

4. **CDN for Static Assets**: Consider Cloudflare or similar

## Next Steps After Deployment

1. Test all admin features
2. Test payment flow (with test cards)
3. Verify email notifications work
4. Monitor logs for first 24 hours
5. Set up monitoring/alerting (optional)

