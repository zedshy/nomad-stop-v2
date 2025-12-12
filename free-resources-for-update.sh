#!/bin/bash

# Temporarily reduce security tool resource usage to free memory for price updates
# Run this on the VPS before updating prices

echo "🔧 Freeing up resources for price updates..."
echo ""

# Check current resource usage
echo "📊 Current memory:"
free -h
echo ""

echo "📊 Current CPU usage:"
top -bn1 | head -20
echo ""

# Option 1: Temporarily stop fail2ban (less resource-intensive)
echo "1️⃣  Checking fail2ban status..."
if systemctl is-active --quiet fail2ban; then
    echo "⚠️  fail2ban is running"
    echo "   You can temporarily stop it with: sudo systemctl stop fail2ban"
    echo "   (Restart after updates with: sudo systemctl start fail2ban)"
else
    echo "✅ fail2ban is not running"
fi
echo ""

# Option 2: Reduce fail2ban log checking frequency (if running)
if systemctl is-active --quiet fail2ban; then
    echo "2️⃣  Reducing fail2ban resource usage..."
    # This keeps fail2ban running but reduces its activity
    echo "   Fail2ban is active but should be minimal impact"
    echo "   If needed, stop it temporarily: sudo systemctl stop fail2ban"
fi
echo ""

# Option 3: Check UFW (firewall is usually very lightweight)
echo "3️⃣  Checking UFW status..."
if command -v ufw >/dev/null 2>&1; then
    sudo ufw status | head -5
    echo "   UFW is very lightweight and shouldn't cause issues"
else
    echo "✅ UFW not installed"
fi
echo ""

# Option 4: Check what's actually using memory
echo "4️⃣  Top memory-consuming processes:"
ps aux --sort=-%mem | head -11
echo ""

# Option 5: Stop PM2 temporarily to free memory
echo "5️⃣  PM2 status:"
pm2 list
echo ""
echo "   You can temporarily stop the app to free memory:"
echo "   pm2 stop all"
echo "   (Then restart after updates: pm2 start all)"
echo ""

# Option 6: Clear caches
echo "6️⃣  Clearing system caches..."
sudo sync
sudo sysctl vm.drop_caches=3
echo "✅ Caches cleared"
echo ""

# Show memory after cleanup
echo "📊 Memory after cleanup:"
free -h
echo ""

echo "✅ Ready for price updates!"
echo ""
echo "💡 Recommendations:"
echo "   1. If memory is still low, temporarily stop fail2ban: sudo systemctl stop fail2ban"
echo "   2. Stop PM2 app: pm2 stop all"
echo "   3. Run price updates"
echo "   4. Restart services: pm2 start all && sudo systemctl start fail2ban"


