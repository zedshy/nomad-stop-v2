#!/bin/bash
# Quick 502 Error Check - Run on VPS

echo "🔍 QUICK 502 DIAGNOSIS"
echo "====================="
echo ""

echo "1. PM2 Status:"
pm2 status
echo ""

echo "2. Port 3000:"
sudo netstat -tuln | grep 3000 || echo "❌ Port 3000 NOT listening"
echo ""

echo "3. PM2 Logs (last 10 lines):"
pm2 logs nomad-stop --lines 10 --nostream 2>/dev/null || echo "No logs found"
echo ""

echo "4. Test localhost:3000:"
curl -I --max-time 3 http://localhost:3000 2>&1 | head -3 || echo "❌ Connection failed"
echo ""

echo "5. Nginx Status:"
sudo systemctl is-active nginx && echo "✅ Nginx running" || echo "❌ Nginx not running"
echo ""

echo "6. Recent Nginx Errors:"
sudo tail -5 /var/log/nginx/error.log 2>/dev/null || echo "No errors found"
echo ""


