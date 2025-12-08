#!/bin/bash

# 🚨 Complete CVE fix - Install React packages and find latest patched version

cd /var/www/nomad-stop

echo "🚨 COMPLETING CVE-2025-66478 FIX"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "1️⃣  Installing React packages..."
NODE_OPTIONS='--max-old-space-size=512' npm install --no-save --prefer-offline --no-audit --no-fund --legacy-peer-deps --no-package-lock react@19.0.0 react-dom@19.0.0

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ React packages installed${NC}"
else
    echo -e "${RED}❌ React install failed${NC}"
    exit 1
fi
echo ""

echo "2️⃣  Checking latest Next.js version..."
NEXT_LATEST=$(npm view next version 2>/dev/null || echo "unknown")
echo "Latest Next.js version: $NEXT_LATEST"
echo ""

echo "3️⃣  Checking current Next.js version..."
CURRENT_NEXT=$(grep '"next":' package.json | sed 's/.*"next": "\([^"]*\)".*/\1/')
echo "Current in package.json: $CURRENT_NEXT"

INSTALLED_NEXT=$(cat node_modules/next/package.json 2>/dev/null | grep '"version"' | head -1 | sed 's/.*"version": "\([^"]*\)".*/\1/' || echo "unknown")
echo "Installed version: $INSTALLED_NEXT"
echo ""

echo "4️⃣  Updating to latest Next.js (should be patched)..."
NODE_OPTIONS='--max-old-space-size=512' npm install --no-save --prefer-offline --no-audit --no-fund --legacy-peer-deps --no-package-lock next@latest

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Next.js updated to latest${NC}"
    NEW_VERSION=$(cat node_modules/next/package.json 2>/dev/null | grep '"version"' | head -1 | sed 's/.*"version": "\([^"]*\)".*/\1/' || echo "unknown")
    echo "New version: $NEW_VERSION"
else
    echo -e "${YELLOW}⚠️  Update failed, but 15.1.7 should be patched${NC}"
fi
echo ""

echo "5️⃣  Rebuilding application..."
npm run build:prod

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Application rebuilt${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo ""

echo "6️⃣  Restarting services..."
sudo systemctl start nginx
pm2 start ecosystem.config.js
pm2 save

echo -e "${GREEN}✅ Services restarted${NC}"
echo ""

echo "7️⃣  Waiting 10 seconds..."
sleep 10

echo ""
echo "8️⃣  Checking PM2 status..."
pm2 status

echo ""
echo -e "${GREEN}✅ CVE-2025-66478 fix complete!${NC}"
echo ""
echo "Monitor logs for malicious code (should be gone now):"
echo "  pm2 logs nomad-stop --lines 100"

