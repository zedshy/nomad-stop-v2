#!/bin/bash

# Check if CVE is actually fixed - look for NEW malicious code

cd /var/www/nomad-stop

echo "🔍 CHECKING IF CVE-2025-66478 IS FIXED"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "1️⃣  Current Next.js version:"
cat node_modules/next/package.json | grep '"version"' | head -1
echo ""

echo "2️⃣  Checking for malicious processes RIGHT NOW:"
CURRENT_MALICIOUS=$(ps aux | grep -E "wget.*176.117|curl.*176.117|r\.sh|/tmp/bot" | grep -v grep)
if [ -n "$CURRENT_MALICIOUS" ]; then
    echo -e "${RED}❌ MALICIOUS PROCESSES RUNNING:${NC}"
    echo "$CURRENT_MALICIOUS"
else
    echo -e "${GREEN}✅ No malicious processes running${NC}"
fi
echo ""

echo "3️⃣  Checking logs from AFTER rebuild (after 17:17:00)..."
RECENT_MALICIOUS=$(pm2 logs nomad-stop --lines 200 --nostream | grep -E "17:1[7-9]|17:2[0-9]" | grep -E "176.117|r\.sh|wget.*bot|curl.*bot")
if [ -n "$RECENT_MALICIOUS" ]; then
    echo -e "${RED}❌ STILL SEEING MALICIOUS CODE AFTER REBUILD:${NC}"
    echo "$RECENT_MALICIOUS"
else
    echo -e "${GREEN}✅ No malicious code in logs after rebuild${NC}"
fi
echo ""

echo "4️⃣  Checking latest log entries (last 20 lines)..."
pm2 logs nomad-stop --lines 20 --nostream | tail -20
echo ""

echo "5️⃣  Testing if site is accessible..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}✅ Site is responding (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ Site not responding (HTTP $HTTP_CODE)${NC}"
fi
echo ""

echo "6️⃣  Monitoring for 30 seconds for new malicious activity..."
echo "Watch for any new malicious code execution..."
timeout 30 pm2 logs nomad-stop --lines 0 --nostream 2>/dev/null | grep -E "176.117|r\.sh|wget.*bot|curl.*bot" && {
    echo -e "${RED}❌ NEW MALICIOUS CODE DETECTED!${NC}"
} || {
    echo -e "${GREEN}✅ No new malicious code in 30 seconds${NC}"
}

echo ""
echo "✅ Check complete"

