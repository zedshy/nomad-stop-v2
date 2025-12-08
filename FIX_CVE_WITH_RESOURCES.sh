#!/bin/bash

# 🚨 Fix CVE-2025-66478 with resource management
# This version handles low memory situations

set -e

cd /var/www/nomad-stop

echo "🚨 FIXING CVE-2025-66478 (React2Shell Vulnerability)"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "1️⃣  Stopping PM2 to free resources..."
pm2 stop nomad-stop 2>/dev/null || true
pm2 delete nomad-stop 2>/dev/null || true
echo -e "${GREEN}✅ PM2 stopped${NC}"
echo ""

echo "2️⃣  Blocking malicious IP..."
sudo ufw deny from 176.117.107.158 2>/dev/null || true
sudo iptables -A INPUT -s 176.117.107.158 -j DROP 2>/dev/null || true
echo -e "${GREEN}✅ IP blocked${NC}"
echo ""

echo "3️⃣  Killing any malicious processes..."
pkill -f "wget.*176.117" 2>/dev/null || true
pkill -f "curl.*176.117" 2>/dev/null || true
pkill -f "r\.sh" 2>/dev/null || true
pkill -f "/tmp/bot" 2>/dev/null || true
echo -e "${GREEN}✅ Malicious processes killed${NC}"
echo ""

echo "4️⃣  Freeing memory..."
sync
echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null 2>&1 || true
echo -e "${GREEN}✅ Memory freed${NC}"
echo ""

echo "5️⃣  Checking Next.js version..."
NEXT_VERSION=$(grep '"next":' package.json | sed 's/.*"next": "\([^"]*\)".*/\1/')
echo "Current Next.js version: $NEXT_VERSION"
echo ""

echo "6️⃣  Method 1: Try to run fix tool non-interactively..."
echo "Installing fix tool first, then running it..."
npm install -g fix-react2shell-next@latest 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Global install failed, trying local...${NC}"
    npx --yes fix-react2shell-next@latest 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Fix tool failed, using manual update method...${NC}"
        
        echo ""
        echo "7️⃣  Method 2: Manually updating Next.js to patched version..."
        echo "Updating Next.js, React, and React-DOM..."
        
        # Update to latest patched versions
        npm install next@latest react@latest react-dom@latest --save
        
        echo -e "${GREEN}✅ Packages updated${NC}"
        echo ""
        
        echo "8️⃣  Rebuilding application..."
        npm run build:prod
        
        echo -e "${GREEN}✅ Application rebuilt${NC}"
        echo ""
        
        echo "9️⃣  Restarting PM2..."
        pm2 start ecosystem.config.js
        pm2 save
        
        echo -e "${GREEN}✅ PM2 restarted${NC}"
        echo ""
        
        echo "🔟  Waiting 10 seconds..."
        sleep 10
        
        echo ""
        echo "1️⃣1️⃣  Checking PM2 status..."
        pm2 status
        
        echo ""
        echo -e "${GREEN}✅ Fix applied manually!${NC}"
        echo ""
        echo "The vulnerability should be patched. Monitor logs:"
        echo "  pm2 logs nomad-stop --lines 100"
        
        exit 0
    }
}

echo -e "${GREEN}✅ Fix tool installed${NC}"
echo ""

echo "7️⃣  Running fix tool..."
fix-react2shell-next || npx --yes fix-react2shell-next
echo -e "${GREEN}✅ Fix applied${NC}"
echo ""

echo "8️⃣  Updating to latest versions..."
npm install next@latest react@latest react-dom@latest
echo -e "${GREEN}✅ Packages updated${NC}"
echo ""

echo "9️⃣  Rebuilding application..."
npm run build:prod
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
echo "Monitor logs: pm2 logs nomad-stop --lines 100"

