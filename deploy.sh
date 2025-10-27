#!/bin/bash

# Nomad Stop - cPanel Deployment Script
# Run this script before uploading to GoDaddy cPanel

echo "🚀 Starting Nomad Stop deployment preparation..."

# Step 1: Build the application
echo "📦 Building Next.js application..."
npm run build

# Step 2: Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Step 3: Copy necessary files for deployment
echo "📁 Preparing deployment files..."

# Create a backup of current database if it exists
if [ -f "prisma/dev.db" ]; then
  echo "💾 Backing up database..."
  cp prisma/dev.db prisma/dev.db.backup
fi

echo "✅ Deployment preparation complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Upload the following to your cPanel:"
echo "   - .env (with production credentials)"
echo "   - .htaccess"
echo "   - .node-version"
echo "   - server.js"
echo "   - package.json"
echo "   - prisma/"
echo "   - public/"
echo "   - .next/"
echo "   - src/"
echo ""
echo "2. In cPanel Terminal, run:"
echo "   cd ~/nomadstop"
echo "   npm install"
echo "   npx prisma migrate deploy"
echo "   npm run seed"
echo "   npm start"
echo ""
echo "3. Configure your Node.js application in cPanel"
echo "   - Go to Node.js"
echo "   - Create application"
echo "   - Set application root: nomadstop"
echo "   - Set startup file: server.js"
echo ""





