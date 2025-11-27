#!/bin/bash
# Quick VPS Update Script
# Run this to update your VPS with the latest changes

echo "🚀 Updating VPS with Latest Changes"
echo "===================================="
echo ""
echo "VPS: 92.205.231.55"
echo "User: nomadadmin"
echo ""
echo "Connecting to VPS..."
echo ""

# SSH into VPS and run update commands
ssh nomadadmin@92.205.231.55 << 'ENDSSH'
cd /var/www/nomad-stop

echo "📥 Pulling latest changes from GitHub..."
git pull origin main

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔧 Generating Prisma Client..."
npx prisma generate

echo ""
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

echo ""
echo "🏗️  Building application..."
npm run build:prod

echo ""
echo "🔄 Restarting application..."
pm2 restart nomad-stop || pm2 start npm --name "nomad-stop" -- start

echo ""
echo "📊 Application Status:"
pm2 status nomad-stop

echo ""
echo "================================"
echo "✅ VPS Updated Successfully!"
echo "================================"
echo ""
echo "🌐 Your site is live at:"
echo "   http://92.205.231.55"
echo "   Admin: http://92.205.231.55/admin"
echo ""
echo "📋 To view logs:"
echo "   pm2 logs nomad-stop"
echo ""
ENDSSH

echo ""
echo "✅ Update Complete!"
echo ""

