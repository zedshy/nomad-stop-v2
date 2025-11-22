#!/bin/bash
# Simple deployment script - run this on your VPS after SSH

echo "🚀 Nomad Stop VPS Deployment"
echo "============================="
echo ""

# Update system
echo "📦 Step 1/12: Updating system..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
echo ""
echo "📦 Step 2/12: Installing Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo "✅ Node.js already installed: $(node -v)"
fi

# Install PM2, Nginx, Git
echo ""
echo "📦 Step 3/12: Installing PM2, Nginx, Git..."
sudo npm install -g pm2
sudo apt install -y nginx git

# Setup project directory
echo ""
echo "📁 Step 4/12: Setting up project directory..."
sudo mkdir -p /var/www/nomad-stop
sudo chown -R $USER:$USER /var/www/nomad-stop
cd /var/www/nomad-stop

# Clone repository
echo ""
echo "📥 Step 5/12: Cloning repository..."
if [ -d ".git" ]; then
    echo "Repository exists, pulling latest..."
    git pull origin main
else
    git clone https://github.com/zedshy/nomad-stop-v2.git .
fi

# Install dependencies (including devDependencies for build)
echo ""
echo "📦 Step 6/12: Installing dependencies (including dev dependencies for build)..."
npm install
npx prisma generate

# Create .env file
echo ""
echo "⚙️  Step 7/12: Creating .env file..."
if [ ! -f ".env" ]; then
    cat > .env << 'EOF'
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
EOF
    echo "✅ .env file created!"
    echo "⚠️  IMPORTANT: Edit .env with your actual values: nano .env"
    read -p "Press Enter after editing .env file..."
else
    echo "✅ .env file already exists"
fi

# Run migrations
echo ""
echo "🗄️  Step 8/12: Running database migrations..."
npx prisma migrate deploy || echo "⚠️  Migration warning (might be normal if tables exist)"

# Build application
echo ""
echo "🔨 Step 9/12: Building application..."
npm run build

# Setup PM2
echo ""
echo "🚀 Step 10/12: Setting up PM2..."
pm2 delete nomad-stop 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# Setup Nginx
echo ""
echo "🌐 Step 11/12: Setting up Nginx..."
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
sudo nginx -t
sudo systemctl restart nginx

# Setup firewall
echo ""
echo "🔥 Step 12/12: Setting up firewall..."
sudo ufw allow 'Nginx Full' 2>/dev/null || true
sudo ufw allow OpenSSH 2>/dev/null || true
sudo ufw --force enable 2>/dev/null || true

echo ""
echo "✅ Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Your site should be live at: http://92.205.231.55"
echo ""
echo "📋 Useful commands:"
echo "   pm2 status              # Check app status"
echo "   pm2 logs nomad-stop     # View logs"
echo "   pm2 restart nomad-stop  # Restart app"
echo ""
pm2 status

