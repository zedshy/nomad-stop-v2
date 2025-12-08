#!/bin/bash

# 🚨 SIMPLE CVE FIX - Minimal memory approach
# Just updates package.json and provides install commands

cd /var/www/nomad-stop

echo "🚨 SIMPLE CVE-2025-66478 FIX"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "1️⃣  Resolving git conflict..."
git stash
git pull origin main
echo -e "${GREEN}✅ Git updated${NC}"
echo ""

echo "2️⃣  Verifying package.json versions..."
grep -E '"next"|"react"|"react-dom"' package.json
echo ""

echo "3️⃣  Checking memory..."
free -h | head -2
echo ""

echo "4️⃣  Stopping everything to free memory..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
sudo systemctl stop nginx 2>/dev/null || true
pkill -9 -f "wget.*176.117" 2>/dev/null || true
pkill -9 -f "curl.*176.117" 2>/dev/null || true
sync
echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null 2>&1 || true
sleep 5
echo -e "${GREEN}✅ Memory freed${NC}"
echo ""

echo "5️⃣  Memory after cleanup:"
free -h | head -2
echo ""

echo "6️⃣  Now try installing with minimal flags:"
echo -e "${YELLOW}npm install --no-save --prefer-offline --no-audit --no-fund --legacy-peer-deps next@15.1.7${NC}"
echo ""
echo "If that works, wait 10 seconds, then:"
echo -e "${YELLOW}npm install --no-save --prefer-offline --no-audit --no-fund --legacy-peer-deps react@19.0.0 react-dom@19.0.0${NC}"
echo ""
echo "Then rebuild:"
echo -e "${YELLOW}npm run build:prod${NC}"
echo ""
echo "Then restart:"
echo -e "${YELLOW}sudo systemctl start nginx${NC}"
echo -e "${YELLOW}pm2 start ecosystem.config.js${NC}"
echo -e "${YELLOW}pm2 save${NC}"

