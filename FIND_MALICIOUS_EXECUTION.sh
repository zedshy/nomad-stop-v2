#!/bin/bash

# Find where malicious code is being executed from
# Run this on the VPS

cd /var/www/nomad-stop

echo "🔍 Finding source of malicious code execution..."
echo ""

echo "1️⃣  Checking PM2 logs for error context..."
pm2 logs nomad-stop --lines 200 --nostream | grep -B 10 -A 10 "176.117\|r\.sh\|Command failed.*cd /tmp" | head -50
echo ""

echo "2️⃣  Checking .next/server files for exec/spawn..."
find .next/server -name "*.js" -exec grep -l "exec\|spawn\|child_process" {} \; 2>/dev/null | head -10
echo ""

echo "3️⃣  Checking for the exact malicious command pattern..."
grep -r "cd /tmp.*rm -rf\|wget.*176.117\|curl.*176.117" .next/ node_modules/ 2>/dev/null | head -20
echo ""

echo "4️⃣  Checking Prisma client for malicious code..."
if [ -d "node_modules/.prisma" ]; then
    find node_modules/.prisma -name "*.js" -exec grep -l "exec\|spawn\|176.117" {} \; 2>/dev/null
fi
echo ""

echo "5️⃣  Checking all API routes in .next/server..."
find .next/server/app/api -name "*.js" 2>/dev/null | while read file; do
    if grep -q "exec\|spawn\|child_process" "$file" 2>/dev/null; then
        echo "⚠️  Found exec/spawn in: $file"
        grep -n "exec\|spawn\|child_process" "$file" | head -5
    fi
done
echo ""

echo "6️⃣  Checking server.js and entry points..."
find .next/server -name "server.js" -o -name "index.js" -o -name "main.js" 2>/dev/null | while read file; do
    if grep -q "exec\|spawn\|child_process\|176.117" "$file" 2>/dev/null; then
        echo "⚠️  Found suspicious code in: $file"
        grep -n "exec\|spawn\|child_process\|176.117" "$file" | head -10
    fi
done
echo ""

echo "7️⃣  Checking for base64 encoded malicious code..."
grep -r "Y2QgL3RtcA==\|d2dldA==\|Y3VybA==" .next/ node_modules/ 2>/dev/null | head -10
echo ""

echo "8️⃣  Checking runtime environment..."
pm2 show nomad-stop | grep -A 30 "env:"
echo ""

echo "✅ Scan complete"

