#!/bin/bash
# Quick Update Script for VPS
# Run this on your VPS to pull latest code and restart

echo "🔄 Pulling latest code from GitHub..."

cd /var/www/nomad-stop

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes. Stashing them..."
    git stash
fi

# Pull latest code
echo "📥 Pulling from GitHub..."
git pull origin main

if [ $? -eq 0 ]; then
    echo "✅ Code pulled successfully!"
    
    # Install dependencies if package.json changed
    echo "📦 Checking if dependencies need updating..."
    npm install
    
    # Generate Prisma client if schema changed
    echo "🔧 Generating Prisma client..."
    npx prisma generate
    
    # Build the application
    echo "🏗️  Building application..."
    npm run build:prod
    
    # Restart PM2
    echo "🔄 Restarting PM2..."
    pm2 restart nomad-stop --update-env
    
    echo ""
    echo "✅ Update complete! Your site is now running the latest code."
    echo ""
    echo "Check status:"
    pm2 status
else
    echo "❌ Failed to pull code. Please check for conflicts."
fi




