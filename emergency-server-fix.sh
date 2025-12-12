#!/bin/bash
# Emergency Server Fix Script
# Use this if server is at max capacity and website is down

HOST="92.205.231.55"
USER="nomadadmin"

echo "🚨 EMERGENCY SERVER FIX"
echo "======================"
echo ""

echo "Step 1: Stopping all PM2 processes..."
ssh $USER@$HOST << 'ENDSSH'
cd /var/www/nomad-stop
pm2 stop all
pm2 delete all
ENDSSH

echo ""
echo "Step 2: Freeing up memory..."
ssh $USER@$HOST << 'ENDSSH'
# Clear system cache if possible
sudo sync
sudo sysctl vm.drop_caches=1 2>/dev/null || echo "Could not clear cache"
ENDSSH

echo ""
echo "Step 3: Checking for resource-hungry processes..."
ssh $USER@$HOST << 'ENDSSH'
echo "Killing any stuck Node processes..."
pkill -9 node 2>/dev/null || echo "No stuck Node processes"
sleep 2
ENDSSH

echo ""
echo "Step 4: Restarting application with limited instances..."
ssh $USER@$HOST << 'ENDSSH'
cd /var/www/nomad-stop

# Start with just 1 instance to reduce load
pm2 start npm --name "nomad-stop" -- start --max-memory-restart 200M
pm2 save

echo ""
echo "PM2 Status:"
pm2 status
ENDSSH

echo ""
echo "Step 5: Checking if app is responding..."
sleep 5
ssh $USER@$HOST << 'ENDSSH'
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo "✅ Application is responding (HTTP $HTTP_CODE)"
else
    echo "❌ Application still not responding (HTTP $HTTP_CODE)"
    echo "Check logs: pm2 logs nomad-stop"
fi
ENDSSH

echo ""
echo "✅ Emergency fix complete!"
echo ""
echo "Monitor with:"
echo "  pm2 monit"
echo "  pm2 logs nomad-stop"

