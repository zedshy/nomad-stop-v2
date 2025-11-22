# VPS Deployment Status

## Current Status: ❌ **NOT DEPLOYED YET**

We've been attempting to deploy, but automated SSH password authentication isn't working from Cursor's terminal. 

## What Needs to Be Done

You'll need to **manually SSH into your VPS** and run the deployment commands. Here's everything you need:

## Step-by-Step Deployment Guide

### 1. SSH into Your VPS

Open a **separate terminal** on your Mac and run:

```bash
ssh nomadadmin@92.205.231.55
# Password: Nomad133@
```

### 2. Once Connected, Run These Commands

I'll create a single deployment script you can copy-paste or download and run directly on the VPS.

---

## Quick Deployment (All-in-One Script)

Once you're SSH'd into the VPS, you can run this single command to download and execute the deployment script:

```bash
curl -sSL https://raw.githubusercontent.com/zedshy/nomad-stop-v2/main/scripts/simple-deploy.sh | bash
```

**OR** manually copy-paste the commands below.

---

## Manual Deployment Steps

If the script doesn't work, run these commands one by one:

```bash
# Step 1: Update system
sudo apt update && sudo apt upgrade -y

# Step 2: Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs
node -v
npm -v

# Step 3: Install PM2, Nginx, Git
sudo npm install -g pm2
sudo apt install -y nginx git

# Step 4: Create project directory
sudo mkdir -p /var/www/nomad-stop
sudo chown -R nomadadmin:nomadadmin /var/www/nomad-stop
cd /var/www/nomad-stop

# Step 5: Clone repository
rm -rf * .* 2>/dev/null || true
git clone https://github.com/zedshy/nomad-stop-v2.git .

# Step 6: Install dependencies
npm install --production
npx prisma generate

# Step 7: Create .env file (YOU MUST EDIT THIS WITH YOUR VALUES!)
nano .env
# Paste your actual environment variables here

# Step 8: Run database migrations
npx prisma migrate deploy

# Step 9: Build application
npm run build

# Step 10: Start with PM2
pm2 delete nomad-stop 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# Step 11: Configure Nginx
sudo tee /etc/nginx/sites-available/nomad-stop > /dev/null << 'EOF'
server {
    listen 80;
    server_name 92.205.231.55;
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
EOF

sudo ln -sf /etc/nginx/sites-available/nomad-stop /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Step 12: Set up firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

# Step 13: Check status
pm2 status
pm2 logs nomad-stop --lines 50
```

---

## Required Environment Variables (.env file)

You **MUST** create/edit the `.env` file with your actual values:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
DISABLE_DB="false"
NODE_ENV="production"
NEXT_PUBLIC_SITE_URL="http://92.205.231.55"
WORLDPAY_USERNAME="your_actual_username"
WORLDPAY_PASSWORD="your_actual_password"
WORLDPAY_CHECKOUT_ID="your_actual_checkout_id"
WORLDPAY_ENTITY_ID="your_actual_entity_id"
WORLDPAY_ENVIRONMENT="production"
WORLDPAY_WEBHOOK_SECRET="your_actual_webhook_secret"
EMAIL_HOST="smtp.gmail.com"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-email-password"
ADMIN_EMAIL="admin@nomadstop.com"
ADMIN_PASSWORD="your-secure-password"
```

**To edit the .env file after cloning:**
```bash
cd /var/www/nomad-stop
nano .env
# Paste your values, save with Ctrl+X, then Y, then Enter
```

---

## Verify Deployment

After running all commands, check:

1. **PM2 Status:**
   ```bash
   pm2 status
   ```
   Should show `nomad-stop` as `online`

2. **Application Logs:**
   ```bash
   pm2 logs nomad-stop --lines 50
   ```
   Should show no errors

3. **Nginx Status:**
   ```bash
   sudo systemctl status nginx
   ```
   Should show `active (running)`

4. **Visit the site:**
   Open in browser: `http://92.205.231.55`

---

## Troubleshooting

### If PM2 shows app as "errored":
```bash
pm2 logs nomad-stop --lines 100
# Check for errors in logs
```

### If site doesn't load:
```bash
# Check if app is running on port 3000
sudo netstat -tuln | grep 3000

# Check Nginx config
sudo nginx -t

# Restart services
pm2 restart nomad-stop
sudo systemctl restart nginx
```

### If database connection fails:
- Double-check your `DATABASE_URL` in `.env`
- Make sure your database allows connections from the VPS IP
- Run: `npx prisma migrate deploy` again

---

## Next Steps After Deployment

1. ✅ Configure SSL certificate (Let's Encrypt)
2. ✅ Set up domain name (point DNS to VPS IP)
3. ✅ Test payment flow end-to-end
4. ✅ Set up monitoring and backups

---

**Status**: Ready for manual deployment. All scripts and configurations are ready in the GitHub repository.

