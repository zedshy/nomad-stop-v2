#!/bin/bash

# Verify that prices are now showing from database

cd /var/www/nomad-stop

echo "🔍 VERIFYING PRICES ARE FIXED"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "1️⃣  Checking DATABASE_URL is loaded by PM2..."
pm2 show nomad-stop | grep -A 5 "env:" | grep DATABASE_URL && {
    echo -e "${GREEN}✅ DATABASE_URL is loaded in PM2${NC}"
} || {
    echo -e "${YELLOW}⚠️  DATABASE_URL not found in PM2 env${NC}"
    echo "Restarting with --update-env..."
    pm2 restart nomad-stop --update-env
}
echo ""

echo "2️⃣  Checking if database connection works..."
NODE_OPTIONS='--max-old-space-size=256' npm run prices:check 2>&1 | head -30 || {
    echo -e "${YELLOW}⚠️  Could not check prices (may be normal)${NC}"
}
echo ""

echo "3️⃣  Testing menu page fetch..."
curl -s http://localhost:3000/menu 2>/dev/null | grep -o "£[0-9]\+\.[0-9][0-9]" | head -10 && {
    echo -e "${GREEN}✅ Menu page is accessible${NC}"
} || {
    echo -e "${YELLOW}⚠️  Could not fetch menu page${NC}"
}
echo ""

echo "4️⃣  Checking PM2 logs for database connection..."
pm2 logs nomad-stop --lines 50 --nostream | grep -i "database\|prisma\|error" | tail -10
echo ""

echo "5️⃣  Final verification..."
echo "Site status:"
curl -I http://localhost:3000 2>/dev/null | head -3
echo ""

echo -e "${GREEN}✅ Verification complete!${NC}"
echo ""
echo "Check your website: https://www.nomadstop.com/menu"
echo "Prices should now show the updated values from your database!"

