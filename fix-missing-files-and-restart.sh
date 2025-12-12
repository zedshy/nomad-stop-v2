#!/bin/bash
# Fix missing server.js and build files, then restart properly

HOST="92.205.231.55"
USER="nomadadmin"

echo "🔧 Fixing Missing Files and Restarting App"
echo "==========================================="
echo ""

echo "Step 1: Checking current status..."
ssh $USER@$HOST << 'ENDSSH'
cd /var/www/nomad-stop
echo "Checking if server.js exists:"
ls -la server.js 2>/dev/null || echo "❌ server.js NOT FOUND"
echo ""
echo "Checking if .next directory exists:"
ls -la .next 2>/dev/null | head -5 || echo "❌ .next directory NOT FOUND"
echo ""
echo "Current PM2 status:"
pm2 status
ENDSSH

echo ""
echo "Step 2: Stopping PM2 and cleaning up..."
ssh $USER@$HOST << 'ENDSSH'
cd /var/www/nomad-stop
pm2 stop all
pm2 delete all
pkill -9 node 2>/dev/null || echo "No stuck processes"
ENDSSH

echo ""
echo "Step 3: Pulling latest code from GitHub..."
ssh $USER@$HOST << 'ENDSSH'
cd /var/www/nomad-stop
git pull origin main
ENDSSH

echo ""
echo "Step 4: Checking if server.js exists after pull..."
ssh $USER@$HOST << 'ENDSSH'
cd /var/www/nomad-stop
if [ ! -f "server.js" ]; then
    echo "❌ server.js still missing, checking git status..."
    git status
    git checkout server.js 2>/dev/null || echo "Could not restore server.js"
fi
ls -la server.js
ENDSSH

echo ""
echo "Step 5: Installing dependencies..."
ssh $USER@$HOST << 'ENDSSH'
cd /var/www/nomad-stop
npm install
npx prisma generate
ENDSSH

echo ""
echo "Step 6: Rebuilding application..."
ssh $USER@$HOST << 'ENDSSH'
cd /var/www/nomad-stop
npm run build:prod
ENDSSH

echo ""
echo "Step 7: Starting with PM2..."
ssh $USER@$HOST << 'ENDSSH'
cd /var/www/nomad-stop

# Start using npm start (which runs node server.js from package.json)
# PM2 options must come BEFORE the -- separator
pm2 delete nomad-stop 2>/dev/null || true
pm2 start npm --name "nomad-stop" --instances 1 --max-memory-restart 300M -- start
pm2 save

echo ""
echo "PM2 Status:"
pm2 status
ENDSSH

echo ""
echo "Step 8: Waiting 10 seconds and testing..."
sleep 10
ssh $USER@$HOST << 'ENDSSH'
cd /var/www/nomad-stop
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 --max-time 5 || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo "✅ Application is responding (HTTP $HTTP_CODE)"
    echo ""
    echo "Recent logs:"
    pm2 logs nomad-stop --lines 10 --nostream
else
    echo "❌ Application not responding (HTTP $HTTP_CODE)"
    echo ""
    echo "Error logs:"
    pm2 logs nomad-stop --err --lines 20 --nostream
fi
ENDSSH

echo ""
echo "✅ Fix complete!"
echo ""
echo "Monitor with:"
echo "  pm2 logs nomad-stop"
echo "  pm2 monit"

