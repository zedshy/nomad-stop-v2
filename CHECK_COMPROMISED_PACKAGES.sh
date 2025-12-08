#!/bin/bash

# Check for compromised npm packages
# Run this on the VPS

cd /var/www/nomad-stop

echo "🔍 Checking for compromised npm packages..."
echo ""

# Check package-lock.json for suspicious packages
echo "1️⃣  Checking package-lock.json for suspicious packages..."
if [ -f package-lock.json ]; then
    grep -i "176.117\|r\.sh\|bot\|malicious\|backdoor" package-lock.json && {
        echo "❌ SUSPICIOUS CONTENT FOUND IN package-lock.json!"
    } || {
        echo "✅ No suspicious content in package-lock.json"
    }
else
    echo "⚠️  package-lock.json not found"
fi
echo ""

# Check node_modules for suspicious files
echo "2️⃣  Checking node_modules for suspicious files..."
find node_modules -name "*.js" -exec grep -l "176.117.107.158\|wget.*r\.sh\|curl.*r\.sh\|cd /tmp.*rm -rf" {} \; 2>/dev/null | head -20
echo ""

# Check for postinstall scripts in node_modules
echo "3️⃣  Checking for suspicious postinstall scripts..."
find node_modules -name "package.json" -exec grep -l "postinstall" {} \; 2>/dev/null | while read pkg; do
    if grep -q "176.117\|r\.sh\|bot\|wget\|curl.*http" "$pkg" 2>/dev/null; then
        echo "❌ SUSPICIOUS POSTINSTALL IN: $pkg"
        grep -A 5 "postinstall" "$pkg"
    fi
done
echo ""

# Check for exec/spawn in node_modules
echo "4️⃣  Checking for exec/spawn calls in node_modules..."
find node_modules -name "*.js" -exec grep -l "child_process.*exec\|child_process.*spawn" {} \; 2>/dev/null | head -10
echo ""

echo "✅ Scan complete"

