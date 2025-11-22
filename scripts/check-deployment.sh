#!/bin/bash

echo "🔍 Checking deployment status on VPS..."
echo ""

# Try to connect and check status
ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 nomadadmin@92.205.231.55 << 'ENDSSH'
echo "✅ Connected to VPS"
echo ""
echo "📦 Checking installed dependencies..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check Node.js
if command -v node >/dev/null 2>&1; then
    echo "✅ Node.js: $(node -v)"
else
    echo "❌ Node.js: Not installed"
fi

# Check NPM
if command -v npm >/dev/null 2>&1; then
    echo "✅ NPM: $(npm -v)"
else
    echo "❌ NPM: Not installed"
fi

# Check PM2
if command -v pm2 >/dev/null 2>&1; then
    echo "✅ PM2: $(pm2 -v)"
    echo ""
    echo "📊 PM2 Status:"
    pm2 list
else
    echo "❌ PM2: Not installed"
fi

# Check Nginx
if command -v nginx >/dev/null 2>&1; then
    echo ""
    echo "✅ Nginx: $(nginx -v 2>&1 | head -1)"
else
    echo ""
    echo "❌ Nginx: Not installed"
fi

# Check if app directory exists
echo ""
echo "📁 Checking project directory..."
if [ -d "/var/www/nomad-stop" ]; then
    echo "✅ Project directory exists: /var/www/nomad-stop"
    if [ -f "/var/www/nomad-stop/package.json" ]; then
        echo "✅ package.json found"
        cd /var/www/nomad-stop
        echo "📦 Dependencies installed: $(if [ -d "node_modules" ]; then echo "Yes"; else echo "No"; fi)"
        if [ -d ".next" ]; then
            echo "✅ Application built (.next directory exists)"
        else
            echo "❌ Application not built (.next directory missing)"
        fi
        if [ -f ".env" ]; then
            echo "✅ .env file exists"
        else
            echo "⚠️  .env file missing"
        fi
    else
        echo "⚠️  package.json not found"
    fi
else
    echo "❌ Project directory does not exist"
fi

# Check if app is running on port 3000
echo ""
echo "🌐 Checking if app is running..."
if netstat -tuln 2>/dev/null | grep -q ":3000" || ss -tuln 2>/dev/null | grep -q ":3000"; then
    echo "✅ Something is listening on port 3000"
else
    echo "❌ Nothing listening on port 3000"
fi

# Check Nginx config
echo ""
echo "🌐 Checking Nginx configuration..."
if [ -f "/etc/nginx/sites-enabled/nomad-stop" ]; then
    echo "✅ Nginx config exists"
    sudo nginx -t 2>&1 | head -2
else
    echo "❌ Nginx config not found"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Status check complete!"
else
    echo ""
    echo "❌ Could not connect to VPS. Please check:"
    echo "   - SSH credentials are correct"
    echo "   - VPS is accessible"
    echo "   - Firewall allows SSH (port 22)"
fi

