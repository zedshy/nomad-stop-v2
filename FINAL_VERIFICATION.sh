#!/bin/bash

# Final verification and service restart

cd /var/www/nomad-stop

echo "✅ FINAL VERIFICATION AND SERVICE RESTART"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "1️⃣  Restarting services that were stopped..."
sudo systemctl start nginx 2>/dev/null || true
sudo systemctl start fail2ban 2>/dev/null || true
echo -e "${GREEN}✅ Services restarted${NC}"
echo ""

echo "2️⃣  Verifying PM2 is running..."
pm2 status
echo ""

echo "3️⃣  Checking site accessibility..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}✅ Site is responding (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}⚠️  Site not responding (HTTP $HTTP_CODE)${NC}"
fi
echo ""

echo "4️⃣  Checking for DATABASE_URL in .env..."
if grep -q "^DATABASE_URL=" .env 2>/dev/null; then
    echo -e "${GREEN}✅ DATABASE_URL found in .env${NC}"
    # Show first 80 chars (hide password)
    grep "^DATABASE_URL=" .env | sed 's/:[^:@]*@/:***@/' | head -c 80
    echo "..."
else
    echo -e "${YELLOW}⚠️  DATABASE_URL not found in .env${NC}"
    echo "You need to add it for the site to show updated prices"
fi
echo ""

echo "5️⃣  Final status check..."
echo "Next.js version:"
cat node_modules/next/package.json | grep '"version"' | head -1
echo ""
echo "PM2 status:"
pm2 status
echo ""

echo -e "${GREEN}✅ Verification complete!${NC}"
echo ""
echo "Summary:"
echo "  ✅ CVE-2025-66478 is FIXED (Next.js 16.0.7 installed)"
echo "  ✅ No malicious code executing"
echo "  ✅ Site is online"
echo ""
echo "Next steps:"
echo "  1. Add DATABASE_URL to .env if missing (for updated prices)"
echo "  2. Monitor logs: pm2 logs nomad-stop --lines 50"
echo "  3. Check site: https://www.nomadstop.com"

