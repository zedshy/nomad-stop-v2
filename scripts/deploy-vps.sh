#!/bin/bash

# Nomad Stop VPS Deployment Script
# This script automates deployment to your GoDaddy VPS

set -e  # Exit on any error

echo "🚀 Nomad Stop VPS Deployment Script"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/var/www/nomad-stop"
REPO_URL="https://github.com/zedshy/nomad-stop-v2.git"
APP_NAME="nomad-stop"
NODE_VERSION="20"

echo -e "${BLUE}Step 1: Checking prerequisites...${NC}"

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run this script with sudo${NC}"
    exit 1
fi

# Update system
echo -e "${BLUE}Updating system packages...${NC}"
apt update && apt upgrade -y

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    echo -e "${BLUE}Installing Node.js v${NODE_VERSION}...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt install -y nodejs
else
    echo -e "${GREEN}✓ Node.js already installed: $(node -v)${NC}"
fi

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${BLUE}Installing PM2...${NC}"
    npm install -g pm2
else
    echo -e "${GREEN}✓ PM2 already installed${NC}"
fi

# Install Nginx if not installed
if ! command -v nginx &> /dev/null; then
    echo -e "${BLUE}Installing Nginx...${NC}"
    apt install -y nginx
    systemctl enable nginx
else
    echo -e "${GREEN}✓ Nginx already installed${NC}"
fi

# Install Git if not installed
if ! command -v git &> /dev/null; then
    echo -e "${BLUE}Installing Git...${NC}"
    apt install -y git
else
    echo -e "${GREEN}✓ Git already installed${NC}"
fi

echo ""
echo -e "${BLUE}Step 2: Setting up project directory...${NC}"

# Create project directory
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Clone repository if it doesn't exist
if [ ! -d ".git" ]; then
    echo -e "${BLUE}Cloning repository...${NC}"
    git clone $REPO_URL .
else
    echo -e "${BLUE}Pulling latest changes...${NC}"
    git pull origin main
fi

echo ""
echo -e "${BLUE}Step 3: Installing dependencies...${NC}"

# Install dependencies
npm install --production

# Generate Prisma Client
echo -e "${BLUE}Generating Prisma Client...${NC}"
npx prisma generate

echo ""
echo -e "${BLUE}Step 4: Checking environment variables...${NC}"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}⚠️  WARNING: .env file not found!${NC}"
    echo -e "${BLUE}Creating .env file...${NC}"
    echo ""
    echo "Please add your environment variables to .env file"
    echo "You can edit it with: nano .env"
    echo ""
    
    # Create a template .env file
    cat > .env << 'ENVEOF'
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
DISABLE_DB="false"

# Next.js
NODE_ENV="production"
NEXT_PUBLIC_SITE_URL="http://your-vps-ip"

# Worldpay
WORLDPAY_USERNAME="your_username"
WORLDPAY_PASSWORD="your_password"
WORLDPAY_CHECKOUT_ID="your_checkout_id"
WORLDPAY_ENTITY_ID="your_entity_id"
WORLDPAY_ENVIRONMENT="production"
WORLDPAY_WEBHOOK_SECRET="your_webhook_secret"

# Email
EMAIL_HOST="smtp.gmail.com"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-email-password"
ADMIN_EMAIL="admin@nomadstop.com"

# Admin
ADMIN_PASSWORD="your-secure-password"
ENVEOF
    
    echo -e "${RED}⚠️  IMPORTANT: Edit .env file with your actual credentials before continuing!${NC}"
    echo -e "${BLUE}Press Enter after you've edited .env file...${NC}"
    read
else
    echo -e "${GREEN}✓ .env file found${NC}"
fi

echo ""
echo -e "${BLUE}Step 5: Running database migrations...${NC}"

# Run migrations
npx prisma migrate deploy || echo -e "${RED}⚠️  Migration failed - this might be normal if tables already exist${NC}"

echo ""
echo -e "${BLUE}Step 6: Building application...${NC}"

# Build the application
npm run build

echo ""
echo -e "${BLUE}Step 7: Setting up PM2...${NC}"

# Stop existing PM2 process if running
pm2 delete $APP_NAME 2>/dev/null || true

# Start application with PM2
cd $PROJECT_DIR
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

echo ""
echo -e "${BLUE}Step 8: Setting up Nginx...${NC}"

# Get VPS IP (if no domain)
VPS_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')

# Create Nginx configuration
cat > /etc/nginx/sites-available/$APP_NAME << NGINXEOF
server {
    listen 80;
    server_name $VPS_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
NGINXEOF

# Enable site
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx

echo ""
echo -e "${BLUE}Step 9: Setting up firewall...${NC}"

# Allow HTTP and HTTPS
ufw allow 'Nginx Full' 2>/dev/null || true
ufw allow OpenSSH 2>/dev/null || true
ufw --force enable 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}Your site should now be live at:${NC}"
echo -e "${BLUE}http://$VPS_IP${NC}"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  pm2 status              # Check app status"
echo "  pm2 logs $APP_NAME     # View logs"
echo "  pm2 restart $APP_NAME  # Restart app"
echo "  pm2 monit              # Monitor app"
echo ""
echo -e "${BLUE}To update in the future:${NC}"
echo "  cd $PROJECT_DIR"
echo "  git pull origin main"
echo "  npm install --production"
echo "  npm run build"
echo "  pm2 restart $APP_NAME"
echo ""
echo -e "${GREEN}🎉 Enjoy your deployed application!${NC}"

