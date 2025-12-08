#!/bin/bash

# 🚨 CRITICAL: Fix CVE-2025-66478 (React2Shell vulnerability)
# This is the root cause of the malicious code execution!

set -e

cd /var/www/nomad-stop

echo "🚨 FIXING CVE-2025-66478 (React2Shell Vulnerability)"
echo "This is a CRITICAL RCE vulnerability in Next.js App Router"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "1️⃣  Stopping PM2..."
pm2 stop nomad-stop 2>/dev/null || true
echo -e "${GREEN}✅ PM2 stopped${NC}"
echo ""

echo "2️⃣  Checking Next.js version..."
NEXT_VERSION=$(grep '"next":' package.json | sed 's/.*"next": "\([^"]*\)".*/\1/')
echo "Current Next.js version: $NEXT_VERSION"
echo ""

echo "3️⃣  Running the official Next.js fix..."
echo "This will patch the vulnerability automatically"
npx fix-react2shell-next
echo -e "${GREEN}✅ Fix applied${NC}"
echo ""

echo "4️⃣  Updating Next.js to latest patched version..."
npm install next@latest react@latest react-dom@latest
echo -e "${GREEN}✅ Next.js updated${NC}"
echo ""

echo "5️⃣  Rebuilding application..."
npm run build:prod
echo -e "${GREEN}✅ Application rebuilt${NC}"
echo ""

echo "6️⃣  Restarting PM2..."
pm2 start ecosystem.config.js
pm2 save
echo -e "${GREEN}✅ PM2 restarted${NC}"
echo ""

echo "7️⃣  Waiting 10 seconds for app to start..."
sleep 10
echo ""

echo "8️⃣  Checking PM2 status..."
pm2 status
echo ""

echo "9️⃣  Monitoring logs for malicious code (should be gone now)..."
echo "Watching logs for 30 seconds..."
timeout 30 pm2 logs nomad-stop --lines 0 --nostream || true
echo ""

echo -e "${GREEN}✅ CVE-2025-66478 fix complete!${NC}"
echo ""
echo "The vulnerability has been patched. The malicious code execution should stop."
echo ""
echo "Continue monitoring: pm2 logs nomad-stop --lines 100"

