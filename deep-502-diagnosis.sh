#!/bin/bash
# Deep 502 Error Diagnosis - Find Root Cause
# Run on VPS: cd /var/www/nomad-stop && bash deep-502-diagnosis.sh

echo "🔍 DEEP 502 ERROR DIAGNOSIS"
echo "============================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_DIR="/var/www/nomad-stop"
cd "$APP_DIR" || exit 1

echo "1️⃣  CHECKING PM2 AUTO-START CONFIGURATION"
echo "------------------------------------------"
if systemctl is-enabled pm2-nomadadmin.service >/dev/null 2>&1; then
    echo -e "${GREEN}✅ PM2 startup service is enabled${NC}"
    systemctl status pm2-nomadadmin.service --no-pager | head -15
else
    echo -e "${RED}❌ PM2 startup service is NOT enabled${NC}"
    echo "This is likely the problem!"
fi
echo ""

echo "2️⃣  CHECKING SYSTEM REBOOTS"
echo "----------------------------"
echo "Recent system reboots:"
last reboot | head -5
echo ""

echo "3️⃣  CHECKING PM2 PROCESS STATUS"
echo "-------------------------------"
pm2 status
echo ""

echo "4️⃣  CHECKING PORT 3000"
echo "----------------------"
if sudo netstat -tuln | grep -q ":3000"; then
    echo -e "${GREEN}✅ Port 3000 is listening${NC}"
    sudo netstat -tuln | grep ":3000"
else
    echo -e "${RED}❌ Port 3000 is NOT listening${NC}"
fi
echo ""

echo "5️⃣  CHECKING PM2 LOGS FOR CRASHES"
echo "----------------------------------"
if [ -f "$APP_DIR/logs/err.log" ]; then
    echo "Recent errors from PM2 error log:"
    tail -50 "$APP_DIR/logs/err.log" | grep -i "error\|crash\|fatal\|exception" | tail -20 || echo "No errors found in recent logs"
else
    echo "No error log file found"
fi
echo ""

echo "6️⃣  CHECKING PM2 OUTPUT LOGS"
echo "-----------------------------"
if [ -f "$APP_DIR/logs/out.log" ]; then
    echo "Last 20 lines of output log:"
    tail -20 "$APP_DIR/logs/out.log"
else
    echo "No output log file found"
fi
echo ""

echo "7️⃣  CHECKING SYSTEM MEMORY"
echo "---------------------------"
free -h
echo ""

echo "8️⃣  CHECKING DISK SPACE"
echo "-----------------------"
df -h / | tail -1
echo ""

echo "9️⃣  CHECKING PM2 PROCESS HISTORY"
echo "--------------------------------"
if [ -f ~/.pm2/dump.pm2 ]; then
    echo "PM2 dump file exists (saved processes)"
    cat ~/.pm2/dump.pm2 | jq -r '.[] | "\(.name): \(.pm2_env.status) - Restarts: \(.pm2_env.restart_time)"' 2>/dev/null || echo "Could not parse dump file"
else
    echo -e "${RED}❌ No PM2 dump file found${NC}"
fi
echo ""

echo "🔟 CHECKING SYSTEMD JOURNAL FOR PM2"
echo "-----------------------------------"
echo "Recent PM2 service activity:"
sudo journalctl -u pm2-nomadadmin.service --no-pager -n 30 2>/dev/null || echo "No PM2 service logs found"
echo ""

echo "1️⃣1️⃣  CHECKING APPLICATION ERRORS"
echo "--------------------------------"
echo "Checking for common crash causes:"
echo ""

# Check if .env exists
if [ ! -f "$APP_DIR/.env" ]; then
    echo -e "${RED}❌ .env file missing - app will crash on startup${NC}"
fi

# Check if .next exists
if [ ! -d "$APP_DIR/.next" ]; then
    echo -e "${RED}❌ .next directory missing - app not built${NC}"
fi

# Check database connection (if DATABASE_URL is set)
if grep -q "DATABASE_URL" "$APP_DIR/.env" 2>/dev/null; then
    echo "Database URL configured"
else
    echo -e "${YELLOW}⚠️  DATABASE_URL not found in .env${NC}"
fi
echo ""

echo "1️⃣2️⃣  CHECKING NGINX CONFIGURATION"
echo "----------------------------------"
if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo -e "${GREEN}✅ Nginx config is valid${NC}"
else
    echo -e "${RED}❌ Nginx config has errors${NC}"
    sudo nginx -t
fi
echo ""

echo "===================================="
echo "📋 DIAGNOSIS SUMMARY"
echo "===================================="
echo ""

# Determine likely cause
if ! systemctl is-enabled pm2-nomadadmin.service >/dev/null 2>&1; then
    echo -e "${RED}🔴 ROOT CAUSE: PM2 auto-start service is NOT enabled${NC}"
    echo ""
    echo "Fix:"
    echo "  pm2 startup"
    echo "  # Then run the command it outputs"
    echo "  pm2 save"
elif ! sudo netstat -tuln | grep -q ":3000"; then
    if pm2 list | grep -q "nomad-stop"; then
        STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="nomad-stop") | .pm2_env.status' 2>/dev/null || echo "unknown")
        if [ "$STATUS" = "errored" ] || [ "$STATUS" = "stopped" ]; then
            echo -e "${RED}🔴 ROOT CAUSE: PM2 process is $STATUS - app crashed${NC}"
            echo ""
            echo "Check logs:"
            echo "  pm2 logs nomad-stop --lines 100"
            echo ""
            echo "Fix:"
            echo "  pm2 restart nomad-stop"
        fi
    else
        echo -e "${RED}🔴 ROOT CAUSE: PM2 process not running${NC}"
        echo ""
        echo "Fix:"
        echo "  pm2 start ecosystem.config.js"
        echo "  pm2 save"
    fi
else
    echo -e "${GREEN}✅ Everything appears to be running now${NC}"
    echo "But check the logs above for any crash patterns"
fi

echo ""
echo "For detailed investigation, check:"
echo "  - PM2 logs: pm2 logs nomad-stop --lines 100"
echo "  - System logs: sudo journalctl -u pm2-nomadadmin.service -n 100"
echo "  - Application logs: tail -100 $APP_DIR/logs/err.log"


