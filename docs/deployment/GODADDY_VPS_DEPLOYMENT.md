# Deploy to GoDaddy VPS with Neon Database

Complete step-by-step guide for deploying Nomad Stop to your GoDaddy VPS.

## Architecture

```
GoDaddy VPS (Ubuntu)
    ├── Next.js Application (PM2)
    ├── Nginx (Reverse Proxy)
    └── Connects to → Neon PostgreSQL (Cloud Database)
```

## Prerequisites

- GoDaddy VPS with Ubuntu/Debian
- SSH access to VPS
- Domain name (optional, can use IP initially)
- Neon database (already set up)

## Step 1: Prepare Your Code

### On Your Local Machine

```bash
cd /Users/zeshaanqureshi/Desktop/Nomad-Stop-NextJS

# Make sure all changes are committed
git add .
git commit -m "Ready for VPS deployment"
git push origin main
```

## Step 2: Connect to Your VPS

```bash
# SSH into your GoDaddy VPS
ssh root@your-vps-ip
# Or: ssh username@your-vps-ip

# Update system packages
sudo apt update && sudo apt upgrade -y
```

## Step 3: Install Required Software

### Install Node.js (v18 or higher)

```bash
# Install Node.js using NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v  # Should show v20.x.x
npm -v
```

### Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### Install Nginx (Web Server)

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Install Git

```bash
sudo apt install git -y
```

## Step 4: Clone Your Repository

```bash
# Create project directory
sudo mkdir -p /var/www/nomad-stop
sudo chown -R $USER:$USER /var/www/nomad-stop

# Clone repository
cd /var/www/nomad-stop
git clone https://github.com/zedshy/nomad-stop-js.git .

# Or if you need to use a different method:
# git clone https://github.com/your-username/nomad-stop-js.git .
```

## Step 5: Install Dependencies

```bash
cd /var/www/nomad-stop

# Install Node.js dependencies
npm install --production

# Generate Prisma Client
npx prisma generate
```

## Step 6: Set Up Environment Variables

```bash
# Create .env file
nano .env
```

**Add all your environment variables:**

```bash
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://neondb_owner:npg_4BLcy9jEvdhY@ep-wandering-base-abtz4yht-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
DISABLE_DB="false"

# Next.js
NODE_ENV="production"
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
# Or use IP if no domain: NEXT_PUBLIC_SITE_URL="http://your-vps-ip"

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

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

## Step 7: Build the Application

```bash
cd /var/www/nomad-stop

# Build for production
npm run build

# This creates the .next folder with optimized production build
```

## Step 8: Run Database Migrations

```bash
# Run migrations to create tables
npx prisma migrate deploy

# Seed database (optional - only if starting fresh)
npm run seed
```

## Step 9: Set Up PM2

```bash
cd /var/www/nomad-stop

# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set PM2 to start on system boot
pm2 startup
# Follow the command it outputs (usually: sudo env PATH=... pm2 startup systemd -u username --hp /home/username)
```

**Check PM2 status:**
```bash
pm2 status
pm2 logs nomad-stop
```

## Step 10: Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/nomad-stop
```

**Add this configuration:**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    # Or use your VPS IP: server_name your-vps-ip;

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
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

**Enable the site:**
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/nomad-stop /etc/nginx/sites-enabled/

# Remove default Nginx site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Step 11: Configure Firewall

```bash
# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable

# Check firewall status
sudo ufw status
```

## Step 12: Set Up SSL Certificate (Let's Encrypt)

**Only if you have a domain name:**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot will automatically configure Nginx for HTTPS
# It will also set up auto-renewal
```

## Step 13: Verify Deployment

1. **Check PM2:**
   ```bash
   pm2 status
   pm2 logs nomad-stop
   ```

2. **Check Nginx:**
   ```bash
   sudo systemctl status nginx
   ```

3. **Test Website:**
   - Visit `http://your-vps-ip` or `https://yourdomain.com`
   - Test admin panel: `http://your-vps-ip/admin`
   - Check database connection works

## Step 14: Set Up Monitoring (Optional)

```bash
# Monitor PM2
pm2 monit

# View logs
pm2 logs nomad-stop --lines 50

# Set up log rotation
pm2 install pm2-logrotate
```

## Updating the Application

When you need to update:

```bash
# SSH into VPS
ssh root@your-vps-ip

# Navigate to project
cd /var/www/nomad-stop

# Pull latest code
git pull origin main

# Install new dependencies (if any)
npm install --production

# Regenerate Prisma client (if schema changed)
npx prisma generate

# Run migrations (if any)
npx prisma migrate deploy

# Rebuild application
npm run build

# Restart PM2
pm2 restart nomad-stop

# Check status
pm2 status
pm2 logs nomad-stop
```

## Troubleshooting

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs nomad-stop

# Check if port 3000 is in use
sudo netstat -tulpn | grep 3000

# Restart PM2
pm2 restart nomad-stop
```

### Database Connection Issues

```bash
# Test database connection
cd /var/www/nomad-stop
npx prisma db pull

# Check .env file
cat .env | grep DATABASE_URL

# Verify Neon dashboard for connection limits
```

### Nginx Issues

```bash
# Test Nginx configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Port Already in Use

```bash
# Find what's using port 3000
sudo lsof -i :3000

# Kill the process if needed
sudo kill -9 <PID>
```

### Permission Issues

```bash
# Fix ownership
sudo chown -R $USER:$USER /var/www/nomad-stop

# Fix permissions
chmod -R 755 /var/www/nomad-stop
```

## Security Checklist

- [ ] Change default SSH port (optional but recommended)
- [ ] Use strong passwords for admin accounts
- [ ] Keep .env file secure (not in Git)
- [ ] Enable firewall (ufw)
- [ ] Use SSL/HTTPS (Let's Encrypt)
- [ ] Regularly update system packages: `sudo apt update && sudo apt upgrade`
- [ ] Monitor PM2 logs regularly
- [ ] Set up automated backups (for code, not database - Neon handles DB backups)

## Backup Strategy

### Code Backup
- Use Git (already done)
- Regular commits and pushes

### Database Backup
- Neon handles automatic daily backups
- No action needed

### Environment Variables
- Store securely (password manager)
- Keep a backup copy locally

## Performance Optimization

### PM2 Clustering (if needed)

```bash
# Edit ecosystem.config.js
# Change instances to 'max' or a number
pm2 restart ecosystem.config.js
```

### Nginx Caching (optional)

Add to Nginx config:
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=10g inactive=60m;
```

## Next Steps After Deployment

1. ✅ Test all admin features
2. ✅ Test payment flow (with test cards first)
3. ✅ Verify email notifications work
4. ✅ Monitor logs for first 24 hours
5. ✅ Set up domain name (if not done)
6. ✅ Set up SSL certificate (if not done)
7. ✅ Test from different devices/locations

## Quick Reference Commands

```bash
# PM2
pm2 status
pm2 logs nomad-stop
pm2 restart nomad-stop
pm2 stop nomad-stop
pm2 monit

# Nginx
sudo systemctl status nginx
sudo systemctl restart nginx
sudo nginx -t

# Database
npx prisma migrate deploy
npx prisma db pull
npm run seed

# Updates
git pull origin main
npm install --production
npm run build
pm2 restart nomad-stop
```

## Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs nomad-stop`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check system resources: `htop` or `top`
4. Verify environment variables: `cat .env`

Your site should now be live! 🚀

