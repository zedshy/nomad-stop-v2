#!/bin/bash
# Set Up SSL/HTTPS for nomadstop.co.uk
# Run this on your VPS

echo "🔒 Setting up SSL/HTTPS for nomadstop.co.uk..."
echo ""

# Step 1: Update package list
echo "📦 Updating package list..."
sudo apt update

# Step 2: Install Certbot
echo "🔧 Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Step 3: Check if port 443 is open
echo "🔍 Checking if port 443 is open..."
if sudo ufw status | grep -q "443/tcp"; then
    echo "✅ Port 443 is already open"
else
    echo "🔓 Opening port 443..."
    sudo ufw allow 443/tcp
    sudo ufw reload
    echo "✅ Port 443 is now open"
fi

# Step 4: Verify nginx is running
echo "🔍 Checking nginx status..."
if sudo systemctl is-active --quiet nginx; then
    echo "✅ Nginx is running"
else
    echo "⚠️  Nginx is not running. Starting nginx..."
    sudo systemctl start nginx
    sudo systemctl enable nginx
fi

# Step 5: Verify domain is configured in nginx
echo "🔍 Checking nginx configuration..."
if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration has errors. Please fix before running certbot."
    exit 1
fi

echo ""
echo "✅ Prerequisites are ready!"
echo ""
echo "📋 Now you need to run Certbot manually:"
echo ""
echo "   sudo certbot --nginx -d nomadstop.co.uk -d www.nomadstop.co.uk"
echo ""
echo "Follow the prompts:"
echo "   1. Enter your email address"
echo "   2. Agree to terms (type 'A')"
echo "   3. Choose redirect option (recommended: type '2')"
echo ""

# Ask if user wants to proceed with certbot
read -p "Do you want to run certbot now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Running Certbot..."
    sudo certbot --nginx -d nomadstop.co.uk -d www.nomadstop.co.uk
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ SSL certificate installed successfully!"
        echo ""
        echo "📋 Next steps:"
        echo "   1. Update .env file: NEXT_PUBLIC_SITE_URL=\"https://nomadstop.co.uk\""
        echo "   2. Restart PM2: pm2 restart nomad-stop --update-env"
        echo "   3. Test: https://nomadstop.co.uk"
    else
        echo ""
        echo "❌ Certbot failed. Please check the error messages above."
    fi
else
    echo "ℹ️  Skipping certbot. Run it manually when ready."
fi




