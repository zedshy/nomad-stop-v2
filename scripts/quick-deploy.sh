#!/bin/bash

# Quick deployment script - run this on your VPS after SSH
# This is a simpler version you can paste directly into VPS terminal

set -e

echo "🚀 Nomad Stop Quick Deployment"
echo "==============================="
echo ""

PROJECT_DIR="/var/www/nomad-stop"
REPO_URL="https://github.com/zedshy/nomad-stop-v2.git"

# Update system
echo "📦 Updating system..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
echo "📦 Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Install PM2
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install -y nginx git

# Create project directory
echo "📁 Setting up project..."
sudo mkdir -p $PROJECT_DIR
sudo chown -R $USER:$USER $PROJECT_DIR
cd $PROJECT_DIR

# Clone or pull repository
if [ -d ".git" ]; then
    echo "📥 Pulling latest code..."
    git pull origin main
else
    echo "📥 Cloning repository..."
    git clone $REPO_URL .
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production
npx prisma generate

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo ""
    echo "⚠️  Creating .env file..."
    cat > .env << 'EOF'
# Database - REPLACE WITH YOUR ACTUAL VALUES
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
DISABLE_DB="false"

# Next.js
NODE_ENV="production"
NEXT_PUBLIC_SITE_URL="http://YOUR-VPS-IP"

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
EOF
    echo "✅ .env file created. Please edit it with your actual values!"
    echo "   Run: nano .env"
    echo ""
    read -p "Press Enter after you've edited .env file..."
fi

# Run migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy || echo "⚠️  Migration warning (might be normal)"

# Build application
echo "🔨 Building application..."
npm run build

# Setup PM2
echo "🚀 Setting up PM2..."
pm2 delete nomad-stop 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# Setup Nginx
echo "🌐 Setting up Nginx..."
VPS_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

sudo tee /etc/nginx/sites-available/nomad-stop > /dev/null << NGINXEOF
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
    }
}
NGINXEOF

sudo ln -sf /etc/nginx/sites-available/nomad-stop /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Setup firewall
echo "🔥 Setting up firewall..."
sudo ufw allow 'Nginx Full' 2>/dev/null || true
sudo ufw allow OpenSSH 2>/dev/null || true
sudo ufw --force enable 2>/dev/null || true

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Your site is live at: http://$VPS_IP"
echo ""
echo "📋 Useful commands:"
echo "   pm2 status              # Check app status"
echo "   pm2 logs nomad-stop     # View logs"
echo "   pm2 restart nomad-stop  # Restart app"
echo ""
echo "🚀 Done!"

