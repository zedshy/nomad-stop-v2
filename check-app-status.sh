#!/bin/bash
# Check why app shows online but port 3000 is not listening

HOST="92.205.231.55"
USER="nomadadmin"

echo "🔍 Checking App Status"
echo "====================="
echo ""

ssh $USER@$HOST << 'ENDSSH'
cd /var/www/nomad-stop

echo "1. PM2 Status:"
pm2 status
echo ""

echo "2. Recent Error Logs (last 30 lines):"
pm2 logs nomad-stop --err --lines 30 --nostream | tail -30
echo ""

echo "3. Recent Output Logs (last 30 lines):"
pm2 logs nomad-stop --out --lines 30 --nostream | tail -30
echo ""

echo "4. Check if port 3000 is listening:"
sudo netstat -tuln | grep 3000 || echo "❌ Port 3000 NOT listening"
echo ""

echo "5. Check if server.js exists and is readable:"
ls -la server.js
echo ""

echo "6. Test if we can start the app manually:"
echo "   (This will show any startup errors)"
timeout 5 node server.js 2>&1 || echo "App failed to start or timed out"
echo ""

echo "7. Check CPU usage:"
top -bn1 | head -5
echo ""

echo "8. Check for stuck Node processes:"
ps aux | grep node | grep -v grep
ENDSSH

