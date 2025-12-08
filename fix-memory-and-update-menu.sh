#!/bin/bash

# Fix memory issues and update menu
# Run this on the VPS

echo "🔍 Checking memory usage..."

# Check top memory consumers
echo "Top 10 memory-consuming processes:"
ps aux --sort=-%mem | head -11

echo ""
echo "🛑 Stopping PM2 to free memory..."
pm2 stop all || true

echo ""
echo "🧹 Clearing caches..."
sudo sync
sudo sysctl vm.drop_caches=3 || true

echo ""
echo "📊 Memory after cleanup:"
free -h

echo ""
echo "🔄 Now trying to update menu..."

cd /var/www/nomad-stop

# Try git pull with limited memory
echo "📥 Pulling latest code..."
GIT_OPTIONAL_LOCKS=0 git pull origin main || {
    echo "⚠️  Git pull failed, trying alternative..."
    git fetch origin main
    git reset --hard origin/main
}

# Install with limited memory
echo "📦 Installing dependencies..."
NODE_OPTIONS="--max-old-space-size=512" npm install || echo "⚠️  npm install had issues"

# Generate Prisma
echo "🔧 Generating Prisma Client..."
NODE_OPTIONS="--max-old-space-size=512" npx prisma generate || echo "⚠️  Prisma generate had issues"

# Run menu update with memory limit
echo "🍽️  Running menu update..."
NODE_OPTIONS="--max-old-space-size=512" npm run menu:update

# Restart app
echo ""
echo "🔄 Restarting application..."
pm2 restart all || pm2 start ecosystem.config.js

echo ""
echo "✅ Done!"

