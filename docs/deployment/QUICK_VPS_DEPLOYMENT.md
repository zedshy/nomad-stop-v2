# Quick VPS Deployment Guide

Deploy Nomad Stop to your GoDaddy VPS in minutes!

## Super Simple Deployment

Just run one script and you're done! 🚀

### Step 1: SSH into Your VPS

```bash
ssh root@your-vps-ip
# Or: ssh username@your-vps-ip
```

### Step 2: Download and Run the Deployment Script

```bash
# Download the script
curl -o deploy.sh https://raw.githubusercontent.com/zedshy/nomad-stop-v2/main/scripts/deploy-vps.sh

# Make it executable
chmod +x deploy.sh

# Run it (with sudo if needed)
sudo ./deploy.sh
```

**Or manually run the commands:**

```bash
# Copy the script to your VPS first
# Then run:
cd /path/to/script
chmod +x deploy-vps.sh
sudo ./deploy-vps.sh
```

### Step 3: Add Environment Variables

When the script prompts you, edit the `.env` file:

```bash
nano /var/www/nomad-stop/.env
```

**Add your actual values:**
- `DATABASE_URL` - Your Neon PostgreSQL connection string (with `:5432` port)
- `WORLDPAY_*` - Your Worldpay credentials
- `EMAIL_*` - Your email settings
- `ADMIN_PASSWORD` - Your secure admin password

**Save:** `Ctrl+X`, then `Y`, then `Enter`

### Step 4: Continue the Script

Press `Enter` to continue. The script will:
- ✅ Build the application
- ✅ Run database migrations
- ✅ Start the app with PM2
- ✅ Configure Nginx
- ✅ Set up firewall

### Done! 🎉

Your site will be live at: `http://your-vps-ip`

## What Gets Installed

The script automatically installs:
- ✅ Node.js 20
- ✅ PM2 (process manager)
- ✅ Nginx (web server)
- ✅ Git

## Updating Your Site

When you push changes to GitHub:

```bash
# SSH into VPS
ssh root@your-vps-ip

# Go to project
cd /var/www/nomad-stop

# Pull latest code
git pull origin main

# Install new dependencies (if any)
npm install --production

# Rebuild
npm run build

# Restart
pm2 restart nomad-stop
```

**Or use this one-liner:**

```bash
cd /var/www/nomad-stop && git pull && npm install --production && npm run build && pm2 restart nomad-stop
```

## Common Commands

```bash
# Check app status
pm2 status

# View logs
pm2 logs nomad-stop

# Restart app
pm2 restart nomad-stop

# Stop app
pm2 stop nomad-stop

# Monitor app
pm2 monit
```

## Troubleshooting

### App won't start
```bash
# Check logs
pm2 logs nomad-stop

# Check if port 3000 is in use
sudo netstat -tulpn | grep 3000
```

### Can't access site
```bash
# Check Nginx status
sudo systemctl status nginx

# Check firewall
sudo ufw status

# Test Nginx config
sudo nginx -t
```

### Database errors
```bash
# Check DATABASE_URL in .env
cat /var/www/nomad-stop/.env | grep DATABASE_URL

# Test connection
cd /var/www/nomad-stop
npx prisma db pull
```

## That's It!

Your site is now live on your VPS, just like Vercel but with full control! 🎉

