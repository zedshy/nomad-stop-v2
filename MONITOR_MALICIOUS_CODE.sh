#!/bin/bash

# Monitor for any new malicious code execution

cd /var/www/nomad-stop

echo "🔍 MONITORING FOR MALICIOUS CODE"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get current timestamp
CURRENT_TIME=$(date +%s)
REBUILD_TIME=$(date -d "2025-12-08 17:17:00" +%s 2>/dev/null || echo "0")

echo "1️⃣  Checking for malicious processes..."
MALICIOUS_PROCS=$(ps aux | grep -E "wget.*176.117|curl.*176.117|r\.sh|bot" | grep -v grep)
if [ -z "$MALICIOUS_PROCS" ]; then
    echo -e "${GREEN}✅ No malicious processes running${NC}"
else
    echo -e "${RED}❌ MALICIOUS PROCESSES DETECTED:${NC}"
    echo "$MALICIOUS_PROCS"
fi
echo ""

echo "2️⃣  Checking PM2 logs for malicious downloads (after rebuild)..."
# Check logs from after 17:17:00 (rebuild time)
MALICIOUS_LOGS=$(pm2 logs nomad-stop --lines 500 --nostream 2>/dev/null | grep -E "176.117|r\.sh|wget.*bot|curl.*bot" | grep -E "17:(1[7-9]|2[0-9])|17:3[0-9]|18:" || true)

if [ -z "$MALICIOUS_LOGS" ]; then
    echo -e "${GREEN}✅ No malicious code in logs after rebuild (17:17:00)${NC}"
else
    echo -e "${RED}❌ MALICIOUS CODE DETECTED IN LOGS:${NC}"
    echo "$MALICIOUS_LOGS"
fi
echo ""

echo "3️⃣  Checking for malicious files..."
MALICIOUS_FILES=$(find /tmp /var/tmp -name "bot" -o -name "r.sh" -o -name "dockerd-daemon" 2>/dev/null | head -10)
if [ -z "$MALICIOUS_FILES" ]; then
    echo -e "${GREEN}✅ No malicious files found${NC}"
else
    echo -e "${YELLOW}⚠️  Found suspicious files:${NC}"
    echo "$MALICIOUS_FILES"
fi
echo ""

echo "4️⃣  Monitoring live for 60 seconds..."
echo "Watch for any new malicious activity..."
timeout 60 pm2 logs nomad-stop --lines 0 2>&1 | grep -E "176.117|r\.sh|wget.*bot|curl.*bot" && {
    echo -e "${RED}❌ NEW MALICIOUS CODE DETECTED!${NC}"
    exit 1
} || {
    echo -e "${GREEN}✅ No new malicious code in 60 seconds${NC}"
}
echo ""

echo "5️⃣  Final status..."
echo "Next.js version:"
cat node_modules/next/package.json 2>/dev/null | grep '"version"' | head -1 || echo "Could not determine version"
echo ""
echo "PM2 status:"
pm2 status
echo ""

echo -e "${GREEN}✅ Monitoring complete!${NC}"
echo ""
echo "If no malicious code was detected, the CVE-2025-66478 fix is working correctly."

