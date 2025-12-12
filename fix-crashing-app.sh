#!/bin/bash
# Fix script for repeatedly crashing app
# This will check logs, reduce resource usage, and stabilize the app

HOST="92.205.231.55"
USER="nomadadmin"

echo "🔧 Fixing Crashing Application"
echo "==============================="
echo ""

echo "Step 1: Checking recent error logs..."
ssh $USER@$HOST << 'ENDSSH'
cd /var/www/nomad-stop
echo "Last 50 error lines:"
pm2 logs nomad-stop --err --lines 50 --nostream | tail -50
ENDSSH

echo ""
echo "Step 2: Stopping current PM2 process..."
ssh $USER@$HOST << 'ENDSSH'
cd /var/www/nomad-stop
pm2 stop nomad-stop
pm2 delete nomad-stop
ENDSSH

echo ""
echo "Step 3: Checking for memory/resource issues..."
ssh $USER@$HOST << 'ENDSSH'
echo "Current memory usage:"
free -h
echo ""
echo "Killing any stuck Node processes:"
pkill -9 node 2>/dev/null || echo "No stuck processes"
sleep 2
ENDSSH

echo ""
echo "Step 4: Starting with SINGLE instance (not cluster mode)..."
ssh $USER@$HOST << 'ENDSSH'
cd /var/www/nomad-stop

# Start with single instance and memory limit
pm2 start npm --name "nomad-stop" -- start --max-memory-restart 300M --instances 1
pm2 save

echo ""
echo "PM2 Status:"
pm2 status
ENDSSH

echo ""
echo "Step 5: Waiting 10 seconds and checking if app responds..."
sleep 10
ssh $USER@$HOST << 'ENDSSH'
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 --max-time 5 || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo "✅ Application is responding (HTTP $HTTP_CODE)"
else
    echo "❌ Application not responding (HTTP $HTTP_CODE)"
    echo ""
    echo "Recent logs:"
    pm2 logs nomad-stop --lines 20 --nostream
fi
ENDSSH

echo ""
echo "Step 6: Monitoring for 30 seconds..."
ssh $USER@$HOST << 'ENDSSH'
cd /var/www/nomad-stop
echo "Watching PM2 for 30 seconds..."
timeout 30 pm2 monit 2>/dev/null || pm2 status
ENDSSH

echo ""
echo "✅ Fix complete!"
echo ""
echo "Monitor with:"
echo "  pm2 logs nomad-stop --lines 100"
echo "  pm2 monit"

