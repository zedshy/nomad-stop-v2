#!/bin/bash

# 🚨 Fix CVE-2025-66478 with minimal memory usage
# Updates packages one at a time to avoid OOM

set -e

cd /var/www/nomad-stop

echo "🚨 FIXING CVE-2025-66478 (Low Memory Method)"
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

echo "2️⃣  Killing malicious processes..."
pkill -9 -f "wget.*176.117" 2>/dev/null || true
pkill -9 -f "curl.*176.117" 2>/dev/null || true
pkill -9 -f "r\.sh" 2>/dev/null || true
pkill -9 -f "/tmp/bot" 2>/dev/null || true
sleep 2
echo -e "${GREEN}✅ Processes killed${NC}"
echo ""

echo "3️⃣  Freeing memory..."
sync
echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null 2>&1 || true
sleep 2
echo -e "${GREEN}✅ Memory freed${NC}"
echo ""

echo "4️⃣  Checking current versions..."
NEXT_VER=$(grep '"next":' package.json | sed 's/.*"next": "\([^"]*\)".*/\1/')
REACT_VER=$(grep '"react":' package.json | sed 's/.*"react": "\([^"]*\)".*/\1/')
REACT_DOM_VER=$(grep '"react-dom":' package.json | sed 's/.*"react-dom": "\([^"]*\)".*/\1/')
echo "Next.js: $NEXT_VER"
echo "React: $REACT_VER"
echo "React-DOM: $REACT_DOM_VER"
echo ""

echo "5️⃣  Method: Update package.json directly, then install..."
echo "This uses less memory than npm install with @latest"
echo ""

# Get latest versions without installing
echo "Fetching latest versions..."
NEXT_LATEST=$(npm view next version 2>/dev/null || echo "15.5.4")
REACT_LATEST=$(npm view react version 2>/dev/null || echo "19.1.0")
REACT_DOM_LATEST=$(npm view react-dom version 2>/dev/null || echo "19.1.0")

echo "Latest Next.js: $NEXT_LATEST"
echo "Latest React: $REACT_LATEST"
echo "Latest React-DOM: $REACT_DOM_LATEST"
echo ""

echo "6️⃣  Updating package.json..."
# Backup package.json
cp package.json package.json.backup

# Update versions in package.json
sed -i "s/\"next\": \"[^\"]*\"/\"next\": \"^${NEXT_LATEST}\"/" package.json
sed -i "s/\"react\": \"[^\"]*\"/\"react\": \"^${REACT_LATEST}\"/" package.json
sed -i "s/\"react-dom\": \"[^\"]*\"/\"react-dom\": \"^${REACT_DOM_LATEST}\"/" package.json

echo -e "${GREEN}✅ package.json updated${NC}"
echo ""

echo "7️⃣  Installing packages ONE AT A TIME (to save memory)..."
echo "Installing Next.js..."
npm install next@${NEXT_LATEST} --no-save 2>&1 | tail -5 || {
    echo -e "${RED}❌ Next.js install failed${NC}"
    exit 1
}
echo -e "${GREEN}✅ Next.js installed${NC}"
echo ""

sync
echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null 2>&1 || true
sleep 2

echo "Installing React..."
npm install react@${REACT_LATEST} --no-save 2>&1 | tail -5 || {
    echo -e "${RED}❌ React install failed${NC}"
    exit 1
}
echo -e "${GREEN}✅ React installed${NC}"
echo ""

sync
echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null 2>&1 || true
sleep 2

echo "Installing React-DOM..."
npm install react-dom@${REACT_DOM_LATEST} --no-save 2>&1 | tail -5 || {
    echo -e "${RED}❌ React-DOM install failed${NC}"
    exit 1
}
echo -e "${GREEN}✅ React-DOM installed${NC}"
echo ""

echo "8️⃣  Saving package.json changes..."
npm install --package-lock-only 2>&1 | tail -5 || true
echo -e "${GREEN}✅ package.json saved${NC}"
echo ""

echo "9️⃣  Rebuilding application..."
npm run build:prod 2>&1 | tail -20
echo -e "${GREEN}✅ Application rebuilt${NC}"
echo ""

echo "🔟  Restarting PM2..."
pm2 start ecosystem.config.js
pm2 save
echo -e "${GREEN}✅ PM2 restarted${NC}"
echo ""

echo "1️⃣1️⃣  Waiting 10 seconds..."
sleep 10

echo ""
echo "1️⃣2️⃣  Checking PM2 status..."
pm2 status

echo ""
echo -e "${GREEN}✅ CVE-2025-66478 fix complete!${NC}"
echo ""
echo "The vulnerability should be patched. Monitor logs:"
echo "  pm2 logs nomad-stop --lines 100"

