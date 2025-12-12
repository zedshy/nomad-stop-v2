#!/bin/bash
# Comprehensive Server Resource Diagnostic Script
# Run this to diagnose high resource usage and website downtime

HOST="92.205.231.55"
USER="nomadadmin"

echo "🔍 Server Resource Diagnostic"
echo "=============================="
echo ""

echo "📊 Step 1: System Resource Usage"
echo "---------------------------------"
ssh $USER@$HOST << 'ENDSSH'
echo "CPU Usage:"
top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print "CPU Idle: " 100 - $1 "%"}'
echo ""
echo "Memory Usage:"
free -h
echo ""
echo "Disk Usage:"
df -h | grep -E '^/dev|Filesystem'
echo ""
echo "Load Average:"
uptime
ENDSSH

echo ""
echo "📋 Step 2: PM2 Process Status"
echo "------------------------------"
ssh $USER@$HOST << 'ENDSSH'
cd /var/www/nomad-stop
pm2 status
pm2 list
ENDSSH

echo ""
echo "🔥 Step 3: Top CPU/Memory Consuming Processes"
echo "----------------------------------------------"
ssh $USER@$HOST << 'ENDSSH'
echo "Top 10 CPU consuming processes:"
ps aux --sort=-%cpu | head -11
echo ""
echo "Top 10 Memory consuming processes:"
ps aux --sort=-%mem | head -11
ENDSSH

echo ""
echo "📝 Step 4: Recent Application Logs"
echo "-----------------------------------"
ssh $USER@$HOST << 'ENDSSH'
cd /var/www/nomad-stop
echo "Last 30 lines of error log:"
pm2 logs nomad-stop --err --lines 30 --nostream | tail -30
echo ""
echo "Last 30 lines of output log:"
pm2 logs nomad-stop --out --lines 30 --nostream | tail -30
ENDSSH

echo ""
echo "🌐 Step 5: Network & Port Status"
echo "---------------------------------"
ssh $USER@$HOST << 'ENDSSH'
echo "Port 3000 status:"
sudo netstat -tuln | grep 3000 || echo "Port 3000 not listening"
echo ""
echo "Nginx status:"
sudo systemctl status nginx --no-pager | head -10 || echo "Nginx not running"
echo ""
echo "Active connections:"
sudo netstat -an | grep ESTABLISHED | wc -l
ENDSSH

echo ""
echo "💾 Step 6: Database Connection Check"
echo "-------------------------------------"
ssh $USER@$HOST << 'ENDSSH'
cd /var/www/nomad-stop
if [ -f .env ]; then
    echo "Checking database connection..."
    node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    prisma.\$connect()
      .then(() => {
        console.log('✅ Database connection successful');
        return prisma.\$disconnect();
      })
      .catch((err) => {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
      });
    " 2>&1 || echo "Could not test database connection"
else
    echo ".env file not found"
fi
ENDSSH

echo ""
echo "🔄 Step 7: Check for Zombie Processes"
echo "--------------------------------------"
ssh $USER@$HOST << 'ENDSSH'
echo "Zombie processes:"
ps aux | grep -w Z | grep -v grep || echo "No zombie processes found"
echo ""
echo "PM2 process count:"
pm2 list | grep -c "nomad-stop" || echo "0"
ENDSSH

echo ""
echo "✅ Diagnostic Complete!"
echo ""
echo "Common Issues & Solutions:"
echo "1. High CPU/Memory: Check top processes, may need to restart PM2"
echo "2. Port not listening: App may have crashed, restart with: pm2 restart nomad-stop"
echo "3. Database connection issues: Check DATABASE_URL in .env"
echo "4. Too many PM2 instances: Run 'pm2 delete all' then restart"
echo ""

