#!/bin/bash

# 🚨 ULTRA MINIMAL INSTALL - Stop everything, free max memory

cd /var/www/nomad-stop

echo "🚨 ULTRA MINIMAL INSTALL - Stopping everything"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "1️⃣  Stopping Docker (consuming memory)..."
sudo systemctl stop docker 2>/dev/null || true
sudo pkill -9 dockerd 2>/dev/null || true
sudo pkill -9 -f "dockerd-daemon" 2>/dev/null || true
sleep 3
echo -e "${GREEN}✅ Docker stopped${NC}"
echo ""

echo "2️⃣  Stopping other services..."
sudo systemctl stop nginx 2>/dev/null || true
sudo systemctl stop fail2ban 2>/dev/null || true
pm2 kill 2>/dev/null || true
sleep 2
echo -e "${GREEN}✅ Services stopped${NC}"
echo ""

echo "3️⃣  Freeing all memory..."
sync
echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null 2>&1 || true
sleep 3
echo -e "${GREEN}✅ Memory freed${NC}"
echo ""

echo "4️⃣  Memory status:"
free -h
echo ""

echo "5️⃣  Top memory consumers:"
ps aux --sort=-%mem | head -10
echo ""

echo "6️⃣  Now try this command:"
echo -e "${YELLOW}NODE_OPTIONS='--max-old-space-size=512' npm install --no-save --prefer-offline --no-audit --no-fund --legacy-peer-deps --no-package-lock next@15.1.7${NC}"
echo ""
echo "This limits Node.js to 512MB memory and skips package-lock.json generation"
echo ""
echo "If that works, wait 10 seconds, then:"
echo -e "${YELLOW}NODE_OPTIONS='--max-old-space-size=512' npm install --no-save --prefer-offline --no-audit --no-fund --legacy-peer-deps --no-package-lock react@19.0.0 react-dom@19.0.0${NC}"

