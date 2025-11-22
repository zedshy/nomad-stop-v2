#!/bin/bash
set -e

HOST="92.205.231.55"
USER="nomadadmin"
PASSWORD="Nomad133@"

echo "🚀 Starting automated deployment to VPS..."
echo ""

# Function to run commands on remote server
run_remote() {
    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$USER@$HOST" "$1"
}

echo "📦 Step 1/12: Updating system packages..."
run_remote "sudo apt update && sudo apt upgrade -y"

echo ""
echo "📦 Step 2/12: Installing Node.js 20..."
run_remote "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash - && sudo apt install -y nodejs"
run_remote "node -v && npm -v"

echo ""
echo "📦 Step 3/12: Installing PM2, Nginx, Git..."
run_remote "sudo npm install -g pm2 && sudo apt install -y nginx git"

echo ""
echo "📁 Step 4/12: Setting up project directory..."
run_remote "sudo mkdir -p /var/www/nomad-stop && sudo chown -R $USER:$USER /var/www/nomad-stop"

echo ""
echo "📥 Step 5/12: Cloning repository..."
run_remote "cd /var/www/nomad-stop && rm -rf * .* 2>/dev/null || true && git clone https://github.com/zedshy/nomad-stop-v2.git ."

echo ""
echo "📦 Step 6/12: Installing dependencies..."
run_remote "cd /var/www/nomad-stop && npm install --production && npx prisma generate"

echo ""
echo "⚙️  Step 7/12: Creating .env file template..."
run_remote "cat > /var/www/nomad-stop/.env << 'ENVEOF'
DATABASE_URL=\"postgresql://user:password@host:5432/database?sslmode=require\"
DISABLE_DB=\"false\"
NODE_ENV=\"production\"
NEXT_PUBLIC_SITE_URL=\"http://92.205.231.55\"
WORLDPAY_USERNAME=\"your_username\"
WORLDPAY_PASSWORD=\"your_password\"
WORLDPAY_CHECKOUT_ID=\"your_checkout_id\"
WORLDPAY_ENTITY_ID=\"your_entity_id\"
WORLDPAY_ENVIRONMENT=\"production\"
WORLDPAY_WEBHOOK_SECRET=\"your_webhook_secret\"
EMAIL_HOST=\"smtp.gmail.com\"
EMAIL_USER=\"your-email@gmail.com\"
EMAIL_PASS=\"your-email-password\"
ADMIN_EMAIL=\"admin@nomadstop.com\"
ADMIN_PASSWORD=\"your-secure-password\"
ENVEOF"

echo ""
echo "⚠️  IMPORTANT: .env file created with placeholders!"
echo "You'll need to edit it with your actual values after deployment."

echo ""
echo "🗄️  Step 8/12: Running database migrations..."
run_remote "cd /var/www/nomad-stop && npx prisma migrate deploy"

echo ""
echo "🔨 Step 9/12: Building application..."
run_remote "cd /var/www/nomad-stop && npm run build"

echo ""
echo "🚀 Step 10/12: Setting up PM2..."
run_remote "cd /var/www/nomad-stop && pm2 delete nomad-stop 2>/dev/null || true && pm2 start ecosystem.config.js && pm2 save"

echo ""
echo "🌐 Step 11/12: Setting up Nginx..."
run_remote "sudo tee /etc/nginx/sites-available/nomad-stop > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name 92.205.231.55;
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
NGINXEOF"

run_remote "sudo ln -sf /etc/nginx/sites-available/nomad-stop /etc/nginx/sites-enabled/ && sudo rm -f /etc/nginx/sites-enabled/default && sudo nginx -t && sudo systemctl restart nginx"

echo ""
echo "🔥 Step 12/12: Setting up firewall..."
run_remote "sudo ufw allow 'Nginx Full' 2>/dev/null || true && sudo ufw allow OpenSSH 2>/dev/null || true && sudo ufw --force enable 2>/dev/null || true"

echo ""
echo "✅ Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
run_remote "pm2 status"

echo ""
echo "🎉 Your site should be live at: http://92.205.231.55"
echo "⚠️  Don't forget to edit .env file with your actual values!"
echo "   Run: ssh $USER@$HOST 'nano /var/www/nomad-stop/.env'"

