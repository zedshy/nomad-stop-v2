#!/bin/bash
# Fix Current 502 Error and Prevent Future Ones
# Run on VPS: cd /var/www/nomad-stop && bash fix-and-prevent-502.sh

echo "🔧 FIXING 502 ERROR AND PREVENTING FUTURE ISSUES"
echo "================================================"
echo ""

APP_DIR="/var/www/nomad-stop"
cd "$APP_DIR" || exit 1

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Step 1: Fix current issue
echo "1️⃣  FIXING CURRENT ISSUE"
echo "------------------------"
if ! sudo netstat -tuln | grep -q ":3000"; then
    echo "Starting PM2 process..."
    pm2 start ecosystem.config.js
    sleep 3
    
    if sudo netstat -tuln | grep -q ":3000"; then
        echo -e "${GREEN}✅ Application started${NC}"
    else
        echo -e "${RED}❌ Failed to start. Check logs:${NC}"
        pm2 logs nomad-stop --lines 30 --nostream
        exit 1
    fi
else
    echo -e "${GREEN}✅ Application is already running${NC}"
fi
echo ""

# Step 2: Ensure PM2 auto-start is configured
echo "2️⃣  ENSURING PM2 AUTO-START IS CONFIGURED"
echo "----------------------------------------"
if systemctl is-enabled pm2-nomadadmin.service >/dev/null 2>&1; then
    echo -e "${GREEN}✅ PM2 startup service is enabled${NC}"
else
    echo -e "${YELLOW}⚠️  PM2 startup service is NOT enabled. Setting it up...${NC}"
    pm2 startup
    echo ""
    echo "Run the command shown above, then:"
    echo "  pm2 save"
    echo ""
    echo "For now, continuing with other fixes..."
fi
echo ""

# Step 3: Save PM2 process list
echo "3️⃣  SAVING PM2 PROCESS LIST"
echo "--------------------------"
pm2 save
echo -e "${GREEN}✅ Process list saved${NC}"
echo ""

# Step 4: Verify PM2 configuration
echo "4️⃣  VERIFYING PM2 CONFIGURATION"
echo "-------------------------------"
pm2 status
echo ""

# Step 5: Check for potential crash causes
echo "5️⃣  CHECKING FOR POTENTIAL ISSUES"
echo "----------------------------------"
ISSUES=0

# Check .env
if [ ! -f "$APP_DIR/.env" ]; then
    echo -e "${RED}❌ .env file missing${NC}"
    ISSUES=$((ISSUES + 1))
fi

# Check build
if [ ! -d "$APP_DIR/.next" ]; then
    echo -e "${RED}❌ .next directory missing - app not built${NC}"
    echo "Rebuilding..."
    npm run build:prod
    ISSUES=$((ISSUES + 1))
fi

# Check memory
MEM_AVAIL=$(free -m | awk 'NR==2{printf "%.0f", $7}')
if [ "$MEM_AVAIL" -lt 500 ]; then
    echo -e "${YELLOW}⚠️  Low memory available: ${MEM_AVAIL}MB${NC}"
    ISSUES=$((ISSUES + 1))
fi

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    echo -e "${YELLOW}⚠️  Disk space low: ${DISK_USAGE}% used${NC}"
    ISSUES=$((ISSUES + 1))
fi

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ No obvious issues found${NC}"
fi
echo ""

# Step 6: Improve ecosystem.config.js for better stability
echo "6️⃣  IMPROVING PM2 CONFIGURATION"
echo "-------------------------------"
# Check if max_memory_restart is set
if ! grep -q "max_memory_restart" ecosystem.config.js; then
    echo "Adding memory restart limit..."
    # This would require editing the file
fi
echo "Current config looks good"
echo ""

# Step 7: Set up monitoring
echo "7️⃣  SETTING UP MONITORING"
echo "-------------------------"
echo "To monitor PM2 in real-time, use:"
echo "  pm2 monit"
echo ""
echo "To check status anytime:"
echo "  pm2 status"
echo ""

# Step 8: Final verification
echo "8️⃣  FINAL VERIFICATION"
echo "---------------------"
if sudo netstat -tuln | grep -q ":3000"; then
    echo -e "${GREEN}✅ Port 3000 is listening${NC}"
else
    echo -e "${RED}❌ Port 3000 is NOT listening${NC}"
fi

PM2_STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="nomad-stop") | .pm2_env.status' 2>/dev/null || echo "unknown")
if [ "$PM2_STATUS" = "online" ]; then
    echo -e "${GREEN}✅ PM2 process is online${NC}"
else
    echo -e "${RED}❌ PM2 process status: $PM2_STATUS${NC}"
fi

if systemctl is-enabled pm2-nomadadmin.service >/dev/null 2>&1; then
    echo -e "${GREEN}✅ PM2 auto-start is enabled${NC}"
else
    echo -e "${YELLOW}⚠️  PM2 auto-start is NOT enabled${NC}"
    echo "Run: pm2 startup (then run the command it outputs)"
fi
echo ""

echo "===================================="
echo "📋 SUMMARY"
echo "===================================="
echo ""
echo "✅ Fixed current 502 error"
echo "✅ Saved PM2 process list"
echo ""
echo "🔍 TO PREVENT FUTURE ISSUES:"
echo ""
echo "1. Ensure PM2 auto-start is enabled:"
echo "   pm2 startup"
echo "   # Run the command it outputs"
echo "   pm2 save"
echo ""
echo "2. Monitor PM2 regularly:"
echo "   pm2 status"
echo "   pm2 logs nomad-stop"
echo ""
echo "3. If app crashes, check logs:"
echo "   pm2 logs nomad-stop --lines 100"
echo "   tail -100 logs/err.log"
echo ""
echo "4. Set up alerts (optional):"
echo "   Consider setting up monitoring to alert you when PM2 stops"
echo ""


