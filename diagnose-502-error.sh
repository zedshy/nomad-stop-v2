#!/bin/bash
# Comprehensive 502 Bad Gateway Diagnostic Script
# Run this on your VPS: cd /var/www/nomad-stop && bash diagnose-502-error.sh

echo "🔍 DIAGNOSING 502 BAD GATEWAY ERROR"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: PM2 Status
echo "1️⃣  CHECKING PM2 STATUS"
echo "----------------------"
pm2 status
echo ""

# Check 2: PM2 Logs (last 50 lines)
echo "2️⃣  CHECKING PM2 LOGS (Last 50 lines)"
echo "--------------------------------------"
if pm2 list | grep -q "nomad-stop"; then
    pm2 logs nomad-stop --lines 50 --nostream
else
    echo -e "${RED}❌ PM2 process 'nomad-stop' not found${NC}"
fi
echo ""

# Check 3: Port 3000 Status
echo "3️⃣  CHECKING PORT 3000"
echo "----------------------"
if sudo netstat -tuln | grep -q ":3000"; then
    echo -e "${GREEN}✅ Port 3000 is listening${NC}"
    sudo netstat -tuln | grep ":3000"
else
    echo -e "${RED}❌ Port 3000 is NOT listening${NC}"
    echo "This is likely the cause of the 502 error!"
fi
echo ""

# Check 4: Test localhost:3000
echo "4️⃣  TESTING LOCALHOST:3000"
echo "--------------------------"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ Application responds on localhost:3000${NC}"
    curl -I http://localhost:3000 2>&1 | head -5
else
    echo -e "${RED}❌ Application does NOT respond on localhost:3000${NC}"
    echo "This confirms the 502 error source!"
fi
echo ""

# Check 5: Nginx Status
echo "5️⃣  CHECKING NGINX STATUS"
echo "-------------------------"
if sudo systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx is running${NC}"
else
    echo -e "${RED}❌ Nginx is NOT running${NC}"
fi
sudo systemctl status nginx --no-pager | head -10
echo ""

# Check 6: Nginx Configuration
echo "6️⃣  CHECKING NGINX CONFIGURATION"
echo "--------------------------------"
if sudo nginx -t 2>&1; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration has errors${NC}"
fi
echo ""

# Check 7: Nginx Error Logs
echo "7️⃣  CHECKING NGINX ERROR LOGS (Last 20 lines)"
echo "----------------------------------------------"
if [ -f /var/log/nginx/error.log ]; then
    sudo tail -20 /var/log/nginx/error.log
else
    echo "Error log not found"
fi
echo ""

# Check 8: Application Directory
echo "8️⃣  CHECKING APPLICATION DIRECTORY"
echo "-----------------------------------"
APP_DIR="/var/www/nomad-stop"
if [ -d "$APP_DIR" ]; then
    echo -e "${GREEN}✅ Application directory exists: $APP_DIR${NC}"
    cd "$APP_DIR"
    echo "Current directory: $(pwd)"
    echo "Directory contents:"
    ls -la | head -15
else
    echo -e "${RED}❌ Application directory NOT found: $APP_DIR${NC}"
fi
echo ""

# Check 9: Build Artifacts
echo "9️⃣  CHECKING BUILD ARTIFACTS"
echo "----------------------------"
if [ -d "$APP_DIR/.next" ]; then
    echo -e "${GREEN}✅ .next directory exists${NC}"
    echo "Build directory size: $(du -sh $APP_DIR/.next 2>/dev/null | cut -f1)"
else
    echo -e "${RED}❌ .next directory NOT found - app may not be built${NC}"
fi
echo ""

# Check 10: Environment File
echo "🔟 CHECKING ENVIRONMENT FILE"
echo "----------------------------"
if [ -f "$APP_DIR/.env" ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
    echo "Environment variables (without sensitive data):"
    grep -v "PASSWORD\|SECRET\|PASS" "$APP_DIR/.env" | head -10
else
    echo -e "${RED}❌ .env file NOT found${NC}"
fi
echo ""

# Check 11: Node Process
echo "1️⃣1️⃣  CHECKING NODE PROCESSES"
echo "----------------------------"
if pgrep -f "next\|node.*server.js" > /dev/null; then
    echo -e "${GREEN}✅ Node/Next.js processes found:${NC}"
    ps aux | grep -E "next|node.*server.js" | grep -v grep
else
    echo -e "${RED}❌ No Node/Next.js processes running${NC}"
fi
echo ""

# Check 12: Disk Space
echo "1️⃣2️⃣  CHECKING DISK SPACE"
echo "------------------------"
df -h / | tail -1
echo ""

# Summary and Recommendations
echo "===================================="
echo "📋 SUMMARY & RECOMMENDATIONS"
echo "===================================="
echo ""

# Determine the issue
if ! sudo netstat -tuln | grep -q ":3000"; then
    echo -e "${RED}🔴 MAIN ISSUE: Port 3000 is not listening${NC}"
    echo ""
    echo "Most likely causes:"
    echo "1. PM2 process crashed or stopped"
    echo "2. Application failed to start"
    echo "3. Port conflict"
    echo ""
    echo "🔧 QUICK FIX:"
    echo "cd /var/www/nomad-stop"
    echo "pm2 restart nomad-stop"
    echo "# OR if that doesn't work:"
    echo "pm2 delete nomad-stop"
    echo "pm2 start ecosystem.config.js"
    echo "pm2 save"
elif ! curl -s http://localhost:3000 > /dev/null; then
    echo -e "${RED}🔴 MAIN ISSUE: Application not responding on port 3000${NC}"
    echo ""
    echo "🔧 QUICK FIX:"
    echo "cd /var/www/nomad-stop"
    echo "pm2 logs nomad-stop --lines 100"
    echo "# Check logs for errors, then:"
    echo "pm2 restart nomad-stop"
elif [ ! -d "$APP_DIR/.next" ]; then
    echo -e "${RED}🔴 MAIN ISSUE: Application not built${NC}"
    echo ""
    echo "🔧 QUICK FIX:"
    echo "cd /var/www/nomad-stop"
    echo "npm run build:prod"
    echo "pm2 restart nomad-stop"
else
    echo -e "${YELLOW}⚠️  Issue may be with nginx configuration or upstream timeout${NC}"
    echo ""
    echo "🔧 CHECK:"
    echo "sudo tail -f /var/log/nginx/error.log"
    echo "sudo systemctl restart nginx"
fi

echo ""
echo "For detailed logs, run:"
echo "  pm2 logs nomad-stop --lines 100"
echo "  sudo tail -f /var/log/nginx/error.log"


