#!/bin/bash
# Complete VPS check and fix script
# Run this locally: bash check-and-fix-vps.sh

HOST="92.205.231.55"
USER="nomadadmin"
PASSWORD="Nomad133@"

echo "🔍 Checking VPS Status..."
echo ""

# Function to run commands on VPS
run_vps() {
    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$USER@$HOST" "$1"
}

echo "📊 Step 1: Check PM2 Status"
echo "---------------------------"
run_vps "cd /var/www/nomad-stop && pm2 status"

echo ""
echo "📋 Step 2: Check Application Logs"
echo "----------------------------------"
run_vps "cd /var/www/nomad-stop && pm2 logs nomad-stop --lines 20 --nostream"

echo ""
echo "🌐 Step 3: Check Port 3000"
echo "--------------------------"
run_vps "sudo netstat -tuln | grep 3000 || echo 'Port 3000 not listening'"

echo ""
echo "⚙️  Step 4: Check Environment Variables"
echo "---------------------------------------"
run_vps "cd /var/www/nomad-stop && grep -E 'DISABLE_DB|DATABASE_URL' .env | head -2 || echo '.env file not found'"

echo ""
echo "🚀 Step 5: Restart Application"
echo "------------------------------"
run_vps "cd /var/www/nomad-stop && pm2 restart nomad-stop 2>&1 || pm2 start ecosystem.config.js"

echo ""
echo "✅ Check Complete!"
echo ""
echo "If app is still not running, you may need to:"
echo "1. Check database connection"
echo "2. Rebuild the application"
echo "3. Check .env file has all required values"




