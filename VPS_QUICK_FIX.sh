#!/bin/bash
# Quick fix script for VPS - run this on your VPS

cd /var/www/nomad-stop

echo "🔧 Fixing Git conflict..."
mv ecosystem.config.js ecosystem.config.js.backup 2>/dev/null || true

echo "📥 Pulling latest code..."
git pull origin main

echo "🔨 Building application (without Turbopack)..."
next build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    echo "🚀 Starting PM2..."
    pm2 delete nomad-stop 2>/dev/null || true
    pm2 start ecosystem.config.js
    pm2 save
    
    echo "📊 PM2 Status:"
    pm2 status
    
    echo ""
    echo "✅ Deployment complete!"
    echo "🌐 Your site should be live at: http://92.205.231.55"
else
    echo "❌ Build failed! Check the error messages above."
    exit 1
fi

