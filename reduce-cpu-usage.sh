#!/bin/bash

# Script to identify and reduce CPU usage on VPS
# Run this on the VPS

echo "🔍 ANALYZING CPU USAGE"
echo "====================="
echo ""

# Check current CPU usage
echo "📊 Current CPU Usage:"
top -bn1 | grep "Cpu(s)" | head -1
echo ""

# Find top CPU-consuming processes
echo "🔥 Top 10 CPU-Consuming Processes:"
echo "-----------------------------------"
ps aux --sort=-%cpu | head -11
echo ""

# Check for specific high-CPU processes
echo "🔍 Checking for known resource-intensive processes:"
echo "---------------------------------------------------"

# Check PM2 processes
echo ""
echo "PM2 Processes:"
pm2 list
echo ""

# Check Node.js processes
echo "Node.js Processes:"
ps aux | grep -E "node|next|npm" | grep -v grep
echo ""

# Check for any miners or suspicious processes
echo "Checking for suspicious processes:"
SUSPICIOUS=$(ps aux | grep -E "xmrig|miner|solrk|\.0ql6uqw4" | grep -v grep)
if [ -n "$SUSPICIOUS" ]; then
    echo "⚠️  SUSPICIOUS PROCESSES FOUND:"
    echo "$SUSPICIOUS"
else
    echo "✅ No suspicious processes found"
fi
echo ""

# Check system processes
echo "System Processes (systemd, etc.):"
ps aux | grep -E "systemd|kthreadd" | head -5
echo ""

# Check database connections
echo "PostgreSQL Connections:"
if command -v psql >/dev/null 2>&1; then
    cd /var/www/nomad-stop
    source .env 2>/dev/null
    if [ -n "$DATABASE_URL" ]; then
        psql "$DATABASE_URL" -c "SELECT count(*) as connections FROM pg_stat_activity;" 2>/dev/null || echo "Could not check database connections"
    fi
fi
echo ""

# Check for runaway cron jobs
echo "Active Cron Jobs:"
crontab -l 2>/dev/null | wc -l | xargs echo "User cron jobs:"
sudo crontab -l 2>/dev/null | wc -l | xargs echo "Root cron jobs:"
echo ""

# Check load average
echo "📈 System Load Average:"
uptime
echo ""

# Check I/O wait (can cause high CPU)
echo "📊 I/O Statistics:"
iostat -x 1 1 2>/dev/null || echo "iostat not available"
echo ""

echo "===================================="
echo "💡 RECOMMENDATIONS TO REDUCE CPU:"
echo "===================================="
echo ""
echo "1. If PM2 app is using too much CPU:"
echo "   pm2 restart all"
echo ""
echo "2. If there are too many Node processes:"
echo "   pkill -f 'node.*next'"
echo ""
echo "3. Stop unnecessary services:"
echo "   sudo systemctl stop fail2ban  # (if not needed temporarily)"
echo ""
echo "4. Check for stuck database connections:"
echo "   psql \$DATABASE_URL -c \"SELECT pid, state, query FROM pg_stat_activity WHERE state != 'idle';\""
echo ""
echo "5. Restart the application:"
echo "   pm2 restart nomad-stop"
echo ""
echo "6. If CPU is still high, check for:"
echo "   - Too many concurrent requests"
echo "   - Infinite loops in code"
echo "   - Database query issues"
echo "   - Memory leaks"
echo ""


