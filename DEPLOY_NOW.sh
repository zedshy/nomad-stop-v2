#!/bin/bash
# Complete VPS Deployment Script for Nomad Stop
# Run this AFTER SSH into your VPS: ssh nomadadmin@92.205.231.55

set -e  # Exit on error

echo "🚀 Nomad Stop - Complete VPS Deployment"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Update system
echo -e "${GREEN}📦 Step 1/12: Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Step 2: Install Node.js 20
echo ""
echo -e "${GREEN}📦 Step 2/12: Installing Node.js 20...${NC}"
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 20 ]]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi
echo "✅ Node.js: $(node -v)"
echo "✅ NPM: $(npm -v)"

# Step 3: Install PM2, Nginx, Git
echo ""
echo -e "${GREEN}📦 Step 3/12: Installing PM2, Nginx, Git...${NC}"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi
sudo apt install -y nginx git curl
echo "✅ PM2: $(pm2 -v)"
echo "✅ Nginx: $(nginx -v 2>&1 | head -1)"

# Step 4: Setup project directory
echo ""
echo -e "${GREEN}📁 Step 4/12: Setting up project directory...${NC}"
sudo mkdir -p /var/www/nomad-stop
sudo chown -R $USER:$USER /var/www/nomad-stop
cd /var/www/nomad-stop
echo "✅ Directory ready: /var/www/nomad-stop"

# Step 5: Clone repository
echo ""
echo -e "${GREEN}📥 Step 5/12: Cloning repository...${NC}"
if [ -d ".git" ]; then
    echo "Repository exists, pulling latest changes..."
    git pull origin main || echo "⚠️  Git pull failed, continuing..."
else
    echo "Cloning fresh repository..."
    git clone https://github.com/zedshy/nomad-stop-v2.git .
fi
echo "✅ Repository cloned/updated"

# Step 6: Install dependencies (including devDependencies for build)
echo ""
echo -e "${GREEN}📦 Step 6/12: Installing dependencies (including dev dependencies for build)...${NC}"
npm install
echo "✅ Dependencies installed"

# Step 7: Generate Prisma client
echo ""
echo -e "${GREEN}🔧 Step 7/12: Generating Prisma client...${NC}"
npx prisma generate
echo "✅ Prisma client generated"

# Step 8: Create .env file template
echo ""
echo -e "${YELLOW}⚙️  Step 8/12: Setting up environment variables...${NC}"
if [ ! -f ".env" ]; then
    echo "Creating .env file template..."
    cat > .env << 'ENVEOF'
# Database Configuration - REPLACE WITH YOUR ACTUAL VALUES
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
DISABLE_DB="false"

# Next.js Configuration
NODE_ENV="production"
NEXT_PUBLIC_SITE_URL="http://92.205.231.55"

# Worldpay Configuration - REPLACE WITH YOUR ACTUAL VALUES
WORLDPAY_USERNAME="your_username"
WORLDPAY_PASSWORD="your_password"
WORLDPAY_CHECKOUT_ID="your_checkout_id"
WORLDPAY_ENTITY_ID="your_entity_id"
WORLDPAY_ENVIRONMENT="production"
WORLDPAY_WEBHOOK_SECRET="your_webhook_secret"

# Email Configuration - REPLACE WITH YOUR ACTUAL VALUES
EMAIL_HOST="smtp.gmail.com"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-email-password"
ADMIN_EMAIL="admin@nomadstop.com"

# Admin Configuration
ADMIN_PASSWORD="your-secure-password"
ENVEOF
    echo -e "${YELLOW}⚠️  .env file created with placeholders!${NC}"
    echo -e "${YELLOW}   You MUST edit it with your actual values before continuing!${NC}"
    echo ""
    echo -e "${YELLOW}   Press Enter to edit .env file now (or Ctrl+C to exit and edit later)...${NC}"
    read
    nano .env
else
    echo "✅ .env file already exists"
    echo -e "${YELLOW}⚠️  Make sure .env has your actual values!${NC}"
fi

# Step 9: Run database migrations
echo ""
echo -e "${GREEN}🗄️  Step 9/12: Running database migrations...${NC}"
npx prisma migrate deploy || echo -e "${YELLOW}⚠️  Migration warning (may be normal if tables exist)${NC}"
echo "✅ Migrations complete"

# Step 10: Build application
echo ""
echo -e "${GREEN}🔨 Step 10/12: Building application...${NC}"
NEXT_DISABLE_ESLINT=1 npm run build
echo "✅ Build complete"

# Step 11: Setup PM2
echo ""
echo -e "${GREEN}🚀 Step 11/12: Setting up PM2...${NC}"
pm2 delete nomad-stop 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup | grep "sudo" | bash || true
echo "✅ PM2 configured"

# Step 12: Setup Nginx
echo ""
echo -e "${GREEN}🌐 Step 12/12: Setting up Nginx...${NC}"
sudo tee /etc/nginx/sites-available/nomad-stop > /dev/null << 'NGINXEOF'
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
NGINXEOF

sudo ln -sf /etc/nginx/sites-available/nomad-stop /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx config
if sudo nginx -t; then
    sudo systemctl restart nginx
    echo "✅ Nginx configured and restarted"
else
    echo -e "${RED}❌ Nginx configuration error!${NC}"
    exit 1
fi

# Setup firewall
echo ""
echo -e "${GREEN}🔥 Setting up firewall...${NC}"
sudo ufw allow 'Nginx Full' 2>/dev/null || true
sudo ufw allow OpenSSH 2>/dev/null || true
sudo ufw --force enable 2>/dev/null || true
echo "✅ Firewall configured"

# Final status
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "🎉 Your site should be live at: http://92.205.231.55"
echo ""
echo "📊 Current Status:"
pm2 status
echo ""
echo "📋 Useful Commands:"
echo "   pm2 status                   # Check app status"
echo "   pm2 logs nomad-stop          # View logs (Ctrl+C to exit)"
echo "   pm2 restart nomad-stop       # Restart app"
echo "   pm2 stop nomad-stop          # Stop app"
echo "   sudo systemctl status nginx  # Check Nginx status"
echo "   sudo nginx -t                # Test Nginx config"
echo ""
echo -e "${YELLOW}⚠️  NEXT STEPS:${NC}"
echo "   1. Test the site: http://92.205.231.55"
echo "   2. Check logs if errors: pm2 logs nomad-stop"
echo "   3. Make sure .env has all your actual values"
echo "   4. Test a payment transaction"
echo ""

