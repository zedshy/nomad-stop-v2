# Fresh VPS Deployment - Step by Step

## Connect to Your VPS

Open a new terminal and connect:

```bash
ssh nomadadmin@92.205.231.55
# Password: Nomad133@
```

---

## Step 1: Update System

```bash
sudo apt update && sudo apt upgrade -y
```

---

## Step 2: Install Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs
node -v
npm -v
```

---

## Step 3: Install PM2, Nginx, Git

```bash
sudo npm install -g pm2
sudo apt install -y nginx git curl
pm2 -v
nginx -v
```

---

## Step 4: Create Project Directory

```bash
sudo mkdir -p /var/www/nomad-stop
sudo chown -R nomadadmin:nomadadmin /var/www/nomad-stop
cd /var/www/nomad-stop
```

---

## Step 5: Clone Repository

```bash
git clone https://github.com/zedshy/nomad-stop-v2.git .
```

---

## Step 6: Install Dependencies

```bash
npm install
npx prisma generate
```

---

## Step 7: Create .env File

```bash
nano .env
```

Paste this (replace with your actual values):

```env
# Database - REPLACE WITH YOUR ACTUAL VALUES
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
DISABLE_DB="false"

# Next.js
NODE_ENV="production"
NEXT_PUBLIC_SITE_URL="http://92.205.231.55"

# Worldpay - REPLACE WITH YOUR ACTUAL VALUES
WORLDPAY_USERNAME="your_username"
WORLDPAY_PASSWORD="your_password"
WORLDPAY_CHECKOUT_ID="your_checkout_id"
WORLDPAY_ENTITY_ID="your_entity_id"
WORLDPAY_ENVIRONMENT="production"
WORLDPAY_WEBHOOK_SECRET="your_webhook_secret"

# Email - REPLACE WITH YOUR ACTUAL VALUES
EMAIL_HOST="smtp.gmail.com"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-email-password"
ADMIN_EMAIL="admin@nomadstop.com"

# Admin
ADMIN_PASSWORD="your-secure-password"
```

Save with: `Ctrl+X`, then `Y`, then `Enter`

---

## Step 8: Run Database Migrations

```bash
npx prisma migrate deploy
```

---

## Step 9: Build Application

```bash
npm run build:prod
```

OR if that fails:

```bash
next build
```

---

## Step 10: Start with PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
pm2 status
```

---

## Step 11: Configure Nginx

```bash
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
```

---

## Step 12: Setup Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable
```

---

## Step 13: Check Status

```bash
pm2 status
pm2 logs nomad-stop --lines 50
```

---

## ✅ Done!

Your site should be live at: **http://92.205.231.55**

---

## Troubleshooting

### If build fails:
```bash
# Check for errors
npm run build:prod 2>&1 | tail -50

# Try without Turbopack
next build
```

### If PM2 shows errors:
```bash
pm2 logs nomad-stop --lines 100
```

### If site doesn't load:
```bash
# Check if app is running
pm2 status

# Check if port 3000 is listening
sudo netstat -tuln | grep 3000

# Check Nginx
sudo systemctl status nginx
sudo nginx -t
```

### To restart everything:
```bash
pm2 restart nomad-stop
sudo systemctl restart nginx
```

---

## Useful Commands

```bash
# View logs
pm2 logs nomad-stop

# Restart app
pm2 restart nomad-stop

# Stop app
pm2 stop nomad-stop

# Check Nginx status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx
```

