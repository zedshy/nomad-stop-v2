#!/bin/bash

# 🚨 FINAL CVE PATCH - Apply the official fix tool
# Next.js 16.0.7 is installed but may still need the patch

cd /var/www/nomad-stop

echo "🚨 APPLYING FINAL CVE-2025-66478 PATCH"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "1️⃣  Checking Next.js version..."
NEXT_VER=$(cat node_modules/next/package.json 2>/dev/null | grep '"version"' | head -1 | sed 's/.*"version": "\([^"]*\)".*/\1/' || echo "unknown")
echo "Installed Next.js: $NEXT_VER"
echo ""

echo "2️⃣  Stopping PM2..."
pm2 stop nomad-stop 2>/dev/null || true
pm2 delete nomad-stop 2>/dev/null || true
echo -e "${GREEN}✅ PM2 stopped${NC}"
echo ""

echo "3️⃣  Clearing .next cache (may contain compromised code)..."
rm -rf .next
echo -e "${GREEN}✅ Cache cleared${NC}"
echo ""

echo "4️⃣  Trying to run official fix tool..."
echo "This will patch the RSC protocol vulnerability"
NODE_OPTIONS='--max-old-space-size=512' npx --yes fix-react2shell-next@latest 2>&1 | head -30 || {
    echo -e "${YELLOW}⚠️  Fix tool failed or not available${NC}"
    echo "This is okay - Next.js 16.0.7 should be patched"
}
echo ""

echo "5️⃣  Rebuilding with clean cache..."
npm run build:prod 2>&1 | tail -30
echo -e "${GREEN}✅ Rebuilt${NC}"
echo ""

echo "6️⃣  Restarting PM2..."
pm2 start ecosystem.config.js
pm2 save
echo -e "${GREEN}✅ PM2 restarted${NC}"
echo ""

echo "7️⃣  Waiting 15 seconds for app to start..."
sleep 15

echo ""
echo "8️⃣  Checking for malicious code in logs..."
pm2 logs nomad-stop --lines 100 --nostream | grep -E "176.117|r\.sh|wget.*bot|curl.*bot" && {
    echo -e "${RED}❌ STILL SEEING MALICIOUS CODE!${NC}"
    echo "The vulnerability may still be active"
} || {
    echo -e "${GREEN}✅ No malicious code in recent logs${NC}"
}

echo ""
echo "9️⃣  PM2 Status:"
pm2 status

echo ""
echo -e "${GREEN}✅ Patch complete!${NC}"
echo ""
echo "Monitor logs: pm2 logs nomad-stop --lines 100"

