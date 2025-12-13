#!/bin/bash

echo "=== Quick Site Diagnosis ==="
echo ""

echo "1. Checking PM2 status..."
pm2 status
echo ""

echo "2. Checking if app is listening on port 3000..."
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000 || echo "Failed to connect to localhost:3000"
echo ""

echo "3. Checking recent PM2 logs (last 20 lines)..."
pm2 logs nomad-stop --lines 20 --nostream
echo ""

echo "4. Checking system resources..."
echo "CPU Load:"
uptime
echo ""
echo "Memory:"
free -h
echo ""

echo "5. Checking if port 3000 is in use..."
netstat -tuln | grep 3000 || ss -tuln | grep 3000 || echo "Port 3000 not found in listening ports"
echo ""

echo "6. Checking nginx status..."
systemctl status nginx --no-pager -l | head -10 || service nginx status | head -10
echo ""

echo "=== Diagnosis Complete ==="

