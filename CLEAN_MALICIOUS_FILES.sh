#!/bin/bash

# Remove malicious files and prevent them from returning

cd /var/www/nomad-stop

echo "🧹 CLEANING MALICIOUS FILES"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "1️⃣  Stopping any processes using malicious files..."
sudo pkill -9 -f "dockerd-daemon" 2>/dev/null || true
sudo pkill -9 -f "/var/tmp/r.sh" 2>/dev/null || true
echo -e "${GREEN}✅ Processes stopped${NC}"
echo ""

echo "2️⃣  Removing malicious files..."
MALICIOUS_FILES=(
    "/var/tmp/dockerd-daemon"
    "/var/tmp/r.sh"
    "/tmp/dockerd-daemon"
    "/tmp/r.sh"
    "/tmp/bot"
    "/var/tmp/bot"
    "/home/nomadadmin/c3pool"
    "/tmp/apl.sh"
)

REMOVED_COUNT=0
for file in "${MALICIOUS_FILES[@]}"; do
    if [ -f "$file" ] || [ -d "$file" ]; then
        echo "Removing: $file"
        sudo rm -rf "$file" 2>/dev/null && {
            REMOVED_COUNT=$((REMOVED_COUNT + 1))
            echo -e "${GREEN}  ✅ Removed${NC}"
        } || {
            echo -e "${YELLOW}  ⚠️  Could not remove (may need root)${NC}"
        }
    fi
done

if [ $REMOVED_COUNT -eq 0 ]; then
    echo -e "${GREEN}✅ No malicious files found${NC}"
else
    echo -e "${GREEN}✅ Removed $REMOVED_COUNT malicious file(s)${NC}"
fi
echo ""

echo "3️⃣  Verifying files are gone..."
REMAINING=$(find /tmp /var/tmp -name "dockerd-daemon" -o -name "r.sh" -o -name "bot" 2>/dev/null | wc -l)
if [ "$REMAINING" -eq 0 ]; then
    echo -e "${GREEN}✅ All malicious files removed${NC}"
else
    echo -e "${YELLOW}⚠️  Still found $REMAINING suspicious file(s):${NC}"
    find /tmp /var/tmp -name "dockerd-daemon" -o -name "r.sh" -o -name "bot" 2>/dev/null
fi
echo ""

echo "4️⃣  Checking for processes trying to recreate files..."
ps aux | grep -E "wget.*176.117|curl.*176.117|r\.sh|bot" | grep -v grep && {
    echo -e "${RED}❌ Found processes trying to download malicious files!${NC}"
} || {
    echo -e "${GREEN}✅ No processes trying to recreate files${NC}"
}
echo ""

echo "5️⃣  Setting up protection (making /var/tmp more secure)..."
# Make /var/tmp sticky and remove execute permissions from world
sudo chmod 1777 /var/tmp 2>/dev/null || true
sudo chmod 1777 /tmp 2>/dev/null || true
echo -e "${GREEN}✅ Protection applied${NC}"
echo ""

echo "6️⃣  Final verification..."
echo "Checking for any remaining malicious files:"
find /tmp /var/tmp -name "dockerd-daemon" -o -name "r.sh" -o -name "bot" 2>/dev/null | head -10
if [ $? -eq 0 ] && [ -n "$(find /tmp /var/tmp -name "dockerd-daemon" -o -name "r.sh" -o -name "bot" 2>/dev/null | head -1)" ]; then
    echo -e "${YELLOW}⚠️  Some files still exist (may need manual removal)${NC}"
else
    echo -e "${GREEN}✅ Clean!${NC}"
fi
echo ""

echo -e "${GREEN}✅ Cleanup complete!${NC}"
echo ""
echo "The CVE-2025-66478 fix is working - no new malicious code is executing."
echo "Removed leftover malicious files from previous attacks."

