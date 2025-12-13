#!/bin/bash

echo "=== Fixing Crashing App ==="
echo ""

cd /var/www/nomad-stop

echo "1. Stopping PM2 app..."
pm2 delete nomad-stop 2>/dev/null || true
pm2 kill 2>/dev/null || true

echo "2. Killing any stuck Node processes..."
pkill -f "node server.js" 2>/dev/null || true
pkill -f "next start" 2>/dev/null || true
sleep 2

echo "3. Killing javs malware process..."
pkill -f javs 2>/dev/null || true
pkill -f .javs 2>/dev/null || true

echo "4. Checking if port 3000 is free..."
if lsof -ti:3000 2>/dev/null; then
    echo "   Port 3000 is in use, killing processes..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

echo "5. Checking server.js exists..."
if [ ! -f "server.js" ]; then
    echo "   ❌ server.js not found! Pulling latest code..."
    git pull origin main
fi

echo "6. Checking .next build exists..."
if [ ! -d ".next" ]; then
    echo "   ❌ .next build not found! Rebuilding..."
    npm run build:prod
fi

echo "7. Testing server.js manually..."
timeout 5 node server.js 2>&1 | head -20 || echo "   Server test completed"

echo "8. Starting PM2 with single instance and memory limit..."
pm2 start npm --name "nomad-stop" --instances 1 --max-memory-restart 300M -- start

echo "9. Waiting 5 seconds for app to start..."
sleep 5

echo "10. Checking PM2 status..."
pm2 status

echo "11. Testing if app responds..."
sleep 2
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000 || echo "   ❌ App not responding"

echo "12. Showing recent logs..."
pm2 logs nomad-stop --lines 10 --nostream

echo ""
echo "=== Fix Complete ==="

