#!/bin/bash

# Add swap space and update menu on VPS
# Run this on the VPS

echo "🔧 Adding swap space to prevent OOM kills..."

# Check if swap already exists
if [ -f /swapfile ]; then
    echo "⚠️  Swap file already exists, skipping creation"
else
    # Create 2GB swap file
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    
    # Make it permanent
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    
    echo "✅ Swap space created (2GB)"
fi

# Show current memory
echo ""
echo "📊 Current memory status:"
free -h

echo ""
echo "🔄 Now updating menu..."

cd /var/www/nomad-stop

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main || echo "⚠️  Git pull failed, continuing..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install || echo "⚠️  npm install had issues, continuing..."

# Generate Prisma
echo "🔧 Generating Prisma Client..."
npx prisma generate || echo "⚠️  Prisma generate had issues, continuing..."

# Run menu update
echo "🍽️  Running menu update..."
npm run menu:update

# Restart app
echo ""
echo "🔄 Restarting application..."
pm2 restart nomad-stop

echo ""
echo "✅ Done!"


