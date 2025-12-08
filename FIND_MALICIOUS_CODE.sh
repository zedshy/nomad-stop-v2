#!/bin/bash

# Find where malicious code is being executed from
# Run this on the VPS

echo "🔍 Finding source of malicious code execution..."
echo ""

cd /var/www/nomad-stop

echo "1️⃣  Checking for malicious code in application files:"
grep -r "176\.117\.107\.158\|wget.*r\.sh\|curl.*r\.sh\|cd /tmp.*rm -rf" . --include="*.js" --include="*.ts" --include="*.tsx" --include="*.json" 2>/dev/null | head -20

echo ""
echo "2️⃣  Checking package.json scripts:"
grep -E "exec|spawn|shell" package.json

echo ""
echo "3️⃣  Checking for suspicious environment variables:"
env | grep -E "176\.117|r\.sh|bot"

echo ""
echo "4️⃣  Checking PM2 environment:"
pm2 show nomad-stop | grep -A 20 "env:"

echo ""
echo "5️⃣  Checking for malicious files in project:"
find . -type f \( -name "*.sh" -o -name "r.sh" -o -name "bot*" \) 2>/dev/null

echo ""
echo "6️⃣  Checking node_modules for compromised packages:"
find node_modules -name "*.js" -exec grep -l "176\.117\.107\.158\|wget.*r\.sh\|curl.*r\.sh" {} \; 2>/dev/null | head -10

echo ""
echo "7️⃣  Checking for postinstall scripts:"
grep -A 5 "postinstall" package.json

echo ""
echo "8️⃣  Checking .next build files (if exists):"
find .next -name "*.js" -exec grep -l "176\.117\|exec\|spawn" {} \; 2>/dev/null | head -10

echo ""
echo "✅ Scan complete"

