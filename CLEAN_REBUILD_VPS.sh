#!/bin/bash

# 🚨 CLEAN REBUILD - Remove compromised code and rebuild from scratch
# Run this on the VPS

set -e

cd /var/www/nomad-stop

echo "🚨 CLEAN REBUILD - Starting..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "1️⃣  Stopping PM2..."
pm2 stop nomad-stop || true
pm2 delete nomad-stop || true
echo -e "${GREEN}✅ PM2 stopped${NC}"
echo ""

echo "2️⃣  Backing up .env file..."
cp .env .env.backup.$(date +%Y%m%d_%H%M%S) || true
echo -e "${GREEN}✅ .env backed up${NC}"
echo ""

echo "3️⃣  Removing compromised build files..."
rm -rf .next
rm -rf node_modules
rm -rf package-lock.json
echo -e "${GREEN}✅ Build files removed${NC}"
echo ""

echo "4️⃣  Checking out clean code from git..."
git fetch origin
git reset --hard origin/main
git clean -fd
echo -e "${GREEN}✅ Code reset to clean state${NC}"
echo ""

echo "5️⃣  Restoring .env file..."
if [ -f .env.backup.* ]; then
    LATEST_ENV=$(ls -t .env.backup.* | head -1)
    cp "$LATEST_ENV" .env
    echo -e "${GREEN}✅ .env restored${NC}"
else
    echo -e "${YELLOW}⚠️  No .env backup found - you'll need to recreate it${NC}"
fi
echo ""

echo "6️⃣  Installing dependencies (clean install)..."
npm ci --production=false
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

echo "7️⃣  Generating Prisma client..."
npx prisma generate
echo -e "${GREEN}✅ Prisma client generated${NC}"
echo ""

echo "8️⃣  Building application..."
npm run build:prod
echo -e "${GREEN}✅ Application built${NC}"
echo ""

echo "9️⃣  Starting PM2..."
pm2 start ecosystem.config.js
pm2 save
echo -e "${GREEN}✅ PM2 started${NC}"
echo ""

echo "🔟  Checking PM2 status..."
pm2 status
echo ""

echo "1️⃣1️⃣  Checking logs for malicious code..."
sleep 5
pm2 logs nomad-stop --lines 20 --nostream | grep -i "176.117\|r.sh\|bot\|wget\|curl.*http" && {
    echo -e "${RED}❌ STILL SEEING MALICIOUS CODE IN LOGS!${NC}"
    echo -e "${YELLOW}This might be from a compromised npm package${NC}"
} || {
    echo -e "${GREEN}✅ No malicious code in logs${NC}"
}
echo ""

echo -e "${GREEN}✅ Clean rebuild complete!${NC}"
echo ""
echo "Monitor logs: pm2 logs nomad-stop"

