#!/bin/bash

# Script to update menu on VPS
# Run this on the VPS after SSH'ing in

echo "🔄 Updating menu on VPS..."
echo ""

# Navigate to project directory
cd /var/www/nomad-stop

# Pull latest changes (including the new script)
echo "📥 Pulling latest code..."
git pull origin main

# Install any new dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Run the menu update script
echo "🍽️  Running menu update script..."
npm run menu:update

echo ""
echo "✅ Menu update complete!"
echo ""
echo "🔄 Restarting application..."
pm2 restart nomad-stop

echo ""
echo "✅ Done! Check your website to see the updated prices."


