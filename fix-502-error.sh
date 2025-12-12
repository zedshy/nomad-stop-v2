#!/bin/bash
# Quick Fix Script for 502 Bad Gateway Error
# Run this on your VPS: cd /var/www/nomad-stop && bash fix-502-error.sh

echo "🔧 FIXING 502 BAD GATEWAY ERROR"
echo "==============================="
echo ""

APP_DIR="/var/www/nomad-stop"
cd "$APP_DIR" || { echo "❌ Cannot access $APP_DIR"; exit 1; }

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Step 1: Check PM2 status
echo "1️⃣  Checking PM2 status..."
if pm2 list | grep -q "nomad-stop"; then
    STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="nomad-stop") | .pm2_env.status' 2>/dev/null || echo "unknown")
    if [ "$STATUS" != "online" ]; then
        echo -e "${YELLOW}⚠️  PM2 process exists but status is: $STATUS${NC}"
        echo "Restarting PM2 process..."
        pm2 restart nomad-stop
        sleep 3
    else
        echo -e "${GREEN}✅ PM2 process is online${NC}"
    fi
else
    echo -e "${RED}❌ PM2 process not found. Starting it...${NC}"
    
    # Check if build exists
    if [ ! -d ".next" ]; then
        echo "Building application first..."
        npm run build:prod
    fi
    
    # Start PM2
    pm2 start ecosystem.config.js
    pm2 save
    sleep 3
fi

# Step 2: Check if port 3000 is listening
echo ""
echo "2️⃣  Checking port 3000..."
sleep 2
if sudo netstat -tuln | grep -q ":3000"; then
    echo -e "${GREEN}✅ Port 3000 is listening${NC}"
else
    echo -e "${RED}❌ Port 3000 is not listening${NC}"
    echo "Attempting to restart PM2..."
    pm2 delete nomad-stop 2>/dev/null
    sleep 2
    
    # Check for build
    if [ ! -d ".next" ]; then
        echo "Building application..."
        npm run build:prod
    fi
    
    # Start fresh
    pm2 start ecosystem.config.js
    pm2 save
    sleep 5
    
    # Check again
    if sudo netstat -tuln | grep -q ":3000"; then
        echo -e "${GREEN}✅ Port 3000 is now listening${NC}"
    else
        echo -e "${RED}❌ Still not listening. Check logs:${NC}"
        pm2 logs nomad-stop --lines 50 --nostream
        exit 1
    fi
fi

# Step 3: Test localhost:3000
echo ""
echo "3️⃣  Testing application response..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}✅ Application responds correctly (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}⚠️  Application returned HTTP $HTTP_CODE${NC}"
    echo "Checking logs..."
    pm2 logs nomad-stop --lines 30 --nostream
fi

# Step 4: Check nginx
echo ""
echo "4️⃣  Checking nginx..."
if sudo systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx is running${NC}"
    
    # Test nginx config
    if sudo nginx -t 2>&1 | grep -q "successful"; then
        echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
    else
        echo -e "${YELLOW}⚠️  Nginx configuration has issues${NC}"
        sudo nginx -t
    fi
    
    # Restart nginx to ensure it picks up any changes
    echo "Restarting nginx..."
    sudo systemctl restart nginx
else
    echo -e "${RED}❌ Nginx is not running. Starting it...${NC}"
    sudo systemctl start nginx
    sudo systemctl enable nginx
fi

# Step 5: Final verification
echo ""
echo "5️⃣  Final verification..."
sleep 2
if sudo netstat -tuln | grep -q ":3000"; then
    echo -e "${GREEN}✅ Port 3000: LISTENING${NC}"
else
    echo -e "${RED}❌ Port 3000: NOT LISTENING${NC}"
fi

PM2_STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="nomad-stop") | .pm2_env.status' 2>/dev/null || echo "unknown")
if [ "$PM2_STATUS" = "online" ]; then
    echo -e "${GREEN}✅ PM2 Status: ONLINE${NC}"
else
    echo -e "${RED}❌ PM2 Status: $PM2_STATUS${NC}"
fi

if sudo systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx: RUNNING${NC}"
else
    echo -e "${RED}❌ Nginx: NOT RUNNING${NC}"
fi

echo ""
echo "===================================="
echo "📋 SUMMARY"
echo "===================================="
echo ""
echo "If the issue persists, check:"
echo "  1. PM2 logs: pm2 logs nomad-stop --lines 100"
echo "  2. Nginx logs: sudo tail -f /var/log/nginx/error.log"
echo "  3. Application logs: pm2 logs nomad-stop"
echo ""
echo "To view real-time logs:"
echo "  pm2 logs nomad-stop"
echo ""


