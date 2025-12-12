#!/bin/bash
# This creates the diagnostic script on the VPS
# Copy everything from "cat > diagnose-502-error.sh << 'SCRIPT_END'" to "SCRIPT_END"

cat > diagnose-502-error.sh << 'SCRIPT_END'
#!/bin/bash
# Comprehensive 502 Bad Gateway Diagnostic Script

echo "🔍 DIAGNOSING 502 BAD GATEWAY ERROR"
echo "===================================="
echo ""

# Check 1: PM2 Status
echo "1️⃣  CHECKING PM2 STATUS"
echo "----------------------"
pm2 status
echo ""

# Check 2: PM2 Logs
echo "2️⃣  CHECKING PM2 LOGS (Last 50 lines)"
echo "--------------------------------------"
if pm2 list | grep -q "nomad-stop"; then
    pm2 logs nomad-stop --lines 50 --nostream
else
    echo "❌ PM2 process 'nomad-stop' not found"
fi
echo ""

# Check 3: Port 3000 Status
echo "3️⃣  CHECKING PORT 3000"
echo "----------------------"
if sudo netstat -tuln | grep -q ":3000"; then
    echo "✅ Port 3000 is listening"
    sudo netstat -tuln | grep ":3000"
else
    echo "❌ Port 3000 is NOT listening"
    echo "This is likely the cause of the 502 error!"
fi
echo ""

# Check 4: Test localhost:3000
echo "4️⃣  TESTING LOCALHOST:3000"
echo "--------------------------"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo "✅ Application responds on localhost:3000 (HTTP $HTTP_CODE)"
else
    echo "❌ Application does NOT respond on localhost:3000 (HTTP $HTTP_CODE)"
fi
echo ""

# Check 5: Nginx Status
echo "5️⃣  CHECKING NGINX STATUS"
echo "-------------------------"
if sudo systemctl is-active --quiet nginx; then
    echo "✅ Nginx is running"
else
    echo "❌ Nginx is NOT running"
fi
sudo systemctl status nginx --no-pager | head -10
echo ""

# Check 6: Nginx Error Logs
echo "6️⃣  CHECKING NGINX ERROR LOGS (Last 20 lines)"
echo "----------------------------------------------"
sudo tail -20 /var/log/nginx/error.log 2>/dev/null || echo "Error log not found"
echo ""

# Check 7: Build Artifacts
echo "7️⃣  CHECKING BUILD ARTIFACTS"
echo "----------------------------"
if [ -d ".next" ]; then
    echo "✅ .next directory exists"
else
    echo "❌ .next directory NOT found - app may not be built"
fi
echo ""

# Summary
echo "===================================="
echo "📋 SUMMARY"
echo "===================================="
echo ""

if ! sudo netstat -tuln | grep -q ":3000"; then
    echo "🔴 MAIN ISSUE: Port 3000 is not listening"
    echo ""
    echo "🔧 QUICK FIX:"
    echo "pm2 restart nomad-stop"
    echo "# OR:"
    echo "pm2 delete nomad-stop"
    echo "pm2 start ecosystem.config.js"
    echo "pm2 save"
elif [ ! -d ".next" ]; then
    echo "🔴 MAIN ISSUE: Application not built"
    echo ""
    echo "🔧 QUICK FIX:"
    echo "npm run build:prod"
    echo "pm2 restart nomad-stop"
else
    echo "⚠️  Check PM2 logs for errors:"
    echo "pm2 logs nomad-stop --lines 100"
fi
SCRIPT_END

chmod +x diagnose-502-error.sh
echo "✅ Diagnostic script created! Run: bash diagnose-502-error.sh"


