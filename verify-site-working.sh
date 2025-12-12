#!/bin/bash
# Quick verification script - run on VPS

echo "🔍 Verifying Site Status"
echo "========================"
echo ""

# Check PM2 status
echo "1. PM2 Status:"
pm2 status
echo ""

# Check port
echo "2. Port 3000:"
sudo netstat -tuln | grep 3000
echo ""

# Check PM2 logs for recent errors
echo "3. Recent PM2 Logs (last 20 lines):"
pm2 logs nomad-stop --lines 20 --nostream
echo ""

# Test with a simpler curl (just headers)
echo "4. Testing HTTP Response:"
curl -I -s http://localhost:3000 | head -10
echo ""

# Check nginx
echo "5. Nginx Status:"
sudo systemctl status nginx --no-pager | head -5
echo ""

echo "✅ If port 3000 is listening and PM2 is online, the site should be working!"
echo "🌐 Test in browser: http://nomadstop.co.uk"


