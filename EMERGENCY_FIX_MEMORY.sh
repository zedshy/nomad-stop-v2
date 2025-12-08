#!/bin/bash

# 🚨 EMERGENCY FIX - Handle severe memory issues
# This script diagnoses and fixes memory problems before applying CVE fix

cd /var/www/nomad-stop

echo "🚨 EMERGENCY MEMORY DIAGNOSIS AND FIX"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "1️⃣  Checking memory..."
free -h
echo ""

echo "2️⃣  Checking swap..."
swapon --show
echo ""

echo "3️⃣  Finding memory-hungry processes..."
ps aux --sort=-%mem | head -15
echo ""

echo "4️⃣  Checking for malicious processes..."
MALICIOUS=$(ps aux | grep -E "wget.*176.117|curl.*176.117|r\.sh|/tmp/bot" | grep -v grep)
if [ -n "$MALICIOUS" ]; then
    echo -e "${RED}❌ MALICIOUS PROCESSES FOUND:${NC}"
    echo "$MALICIOUS"
    echo ""
    echo "Killing malicious processes..."
    pkill -9 -f "wget.*176.117" 2>/dev/null || true
    pkill -9 -f "curl.*176.117" 2>/dev/null || true
    pkill -9 -f "r\.sh" 2>/dev/null || true
    pkill -9 -f "/tmp/bot" 2>/dev/null || true
    sleep 2
    echo -e "${GREEN}✅ Killed${NC}"
else
    echo -e "${GREEN}✅ No malicious processes found${NC}"
fi
echo ""

echo "5️⃣  Stopping PM2..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
sleep 2
echo -e "${GREEN}✅ PM2 stopped${NC}"
echo ""

echo "6️⃣  Stopping non-essential services..."
sudo systemctl stop fail2ban 2>/dev/null || true
sudo systemctl stop nginx 2>/dev/null || true
sleep 2
echo -e "${GREEN}✅ Services stopped${NC}"
echo ""

echo "7️⃣  Freeing all possible memory..."
sync
echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null 2>&1 || true
sleep 3
echo -e "${GREEN}✅ Memory freed${NC}"
echo ""

echo "8️⃣  Checking memory again..."
free -h
echo ""

echo "9️⃣  If swap is low, adding more swap..."
CURRENT_SWAP=$(free -m | grep Swap | awk '{print $2}')
if [ "$CURRENT_SWAP" -lt 4096 ]; then
    echo "Current swap: ${CURRENT_SWAP}MB - adding more..."
    sudo fallocate -l 2G /swapfile2 2>/dev/null || true
    sudo chmod 600 /swapfile2 2>/dev/null || true
    sudo mkswap /swapfile2 2>/dev/null || true
    sudo swapon /swapfile2 2>/dev/null || true
    echo "/swapfile2 none swap sw 0 0" | sudo tee -a /etc/fstab 2>/dev/null || true
    echo -e "${GREEN}✅ Additional swap added${NC}"
else
    echo -e "${GREEN}✅ Swap is sufficient (${CURRENT_SWAP}MB)${NC}"
fi
echo ""

echo "🔟  Final memory check..."
free -h
echo ""

echo "1️⃣1️⃣  Now updating package.json directly (no memory needed)..."
# Backup
cp package.json package.json.backup.$(date +%Y%m%d_%H%M%S)

# Update to patched versions
sed -i 's/"next": "15\.5\.4"/"next": "^15.1.7"/' package.json
sed -i 's/"react": "19\.1\.0"/"react": "^19.0.0"/' package.json  
sed -i 's/"react-dom": "19\.1\.0"/"react-dom": "^19.0.0"/' package.json

echo -e "${GREEN}✅ package.json updated${NC}"
echo "New versions:"
grep -E '"next"|"react"|"react-dom"' package.json
echo ""

echo "1️⃣2️⃣  Ready to install. Run this command:"
echo -e "${YELLOW}npm install --no-save next@15.1.7 react@19.0.0 react-dom@19.0.0${NC}"
echo ""
echo "If that gets killed, try installing one at a time:"
echo -e "${YELLOW}npm install --no-save next@15.1.7${NC}"
echo -e "${YELLOW}(wait 10 seconds)${NC}"
echo -e "${YELLOW}npm install --no-save react@19.0.0 react-dom@19.0.0${NC}"

