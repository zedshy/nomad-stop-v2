#!/bin/bash

# Quick fix for 502 error

cd /var/www/nomad-stop

echo "🔍 Checking PM2 status..."
pm2 status

echo ""
echo "🔍 Checking if port 3000 is listening..."
sudo netstat -tuln | grep 3000 || echo "Port 3000 not listening"

echo ""
echo "🔄 Restarting application..."
pm2 delete nomad-stop 2>/dev/null
pm2 start ecosystem.config.js
pm2 save

echo ""
echo "⏳ Waiting 5 seconds..."
sleep 5

echo ""
echo "🔍 Checking status again..."
pm2 status

echo ""
echo "🔍 Checking port 3000..."
sudo netstat -tuln | grep 3000

echo ""
echo "📋 Recent logs:"
pm2 logs nomad-stop --lines 20 --nostream


