#!/bin/bash

# 🚨 FINAL CLEAN REBUILD - Complete removal and rebuild
# This will completely remove everything and rebuild from scratch

set -e

cd /var/www/nomad-stop

echo "🚨 FINAL CLEAN REBUILD - Starting complete cleanup..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "1️⃣  Stopping PM2..."
pm2 stop nomad-stop 2>/dev/null || true
pm2 delete nomad-stop 2>/dev/null || true
echo -e "${GREEN}✅ PM2 stopped${NC}"
echo ""

echo "2️⃣  Backing up .env file..."
if [ -f .env ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo -e "${GREEN}✅ .env backed up${NC}"
else
    echo -e "${YELLOW}⚠️  No .env file found${NC}"
fi
echo ""

echo "3️⃣  Removing ALL build artifacts and dependencies..."
rm -rf .next
rm -rf node_modules
rm -rf package-lock.json
rm -rf .npm
rm -rf .cache
echo -e "${GREEN}✅ All build files removed${NC}"
echo ""

echo "4️⃣  Resetting to clean git state..."
git fetch origin
git reset --hard origin/main
git clean -fdx
echo -e "${GREEN}✅ Code reset to clean state${NC}"
echo ""

echo "5️⃣  Restoring .env file..."
if ls .env.backup.* 1> /dev/null 2>&1; then
    LATEST_ENV=$(ls -t .env.backup.* | head -1)
    cp "$LATEST_ENV" .env
    echo -e "${GREEN}✅ .env restored from $LATEST_ENV${NC}"
else
    echo -e "${YELLOW}⚠️  No .env backup found - you'll need to recreate it${NC}"
fi
echo ""

echo "6️⃣  Clearing npm cache..."
npm cache clean --force
echo -e "${GREEN}✅ npm cache cleared${NC}"
echo ""

echo "7️⃣  Installing dependencies (clean install, no scripts first)..."
npm ci --ignore-scripts
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

echo "8️⃣  Running postinstall scripts manually..."
npm run postinstall || echo -e "${YELLOW}⚠️  Postinstall failed (may be normal)${NC}"
echo ""

echo "9️⃣  Generating Prisma client..."
npx prisma generate
echo -e "${GREEN}✅ Prisma client generated${NC}"
echo ""

echo "🔟  Building application..."
npm run build:prod
echo -e "${GREEN}✅ Application built${NC}"
echo ""

echo "1️⃣1️⃣  Starting PM2..."
pm2 start ecosystem.config.js
pm2 save
echo -e "${GREEN}✅ PM2 started${NC}"
echo ""

echo "1️⃣2️⃣  Waiting 10 seconds for app to start..."
sleep 10
echo ""

echo "1️⃣3️⃣  Checking PM2 status..."
pm2 status
echo ""

echo "1️⃣4️⃣  Checking logs for malicious code (first 50 lines)..."
pm2 logs nomad-stop --lines 50 --nostream | tail -50
echo ""

echo -e "${GREEN}✅ Clean rebuild complete!${NC}"
echo ""
echo "Monitor logs: pm2 logs nomad-stop --lines 100"
echo ""
echo "If malicious code still appears, check:"
echo "  1. Environment variables: pm2 show nomad-stop | grep -A 30 env"
echo "  2. npm packages: npm audit"
echo "  3. System processes: ps aux | grep -E 'wget|curl|176.117'"

