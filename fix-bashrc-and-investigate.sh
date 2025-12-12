#!/bin/bash
# Fix .bashrc syntax error and investigate malware entry point

HOST="92.205.231.55"
USER="nomadadmin"

echo "🔧 Fixing .bashrc and Investigating Malware"
echo "============================================"
echo ""

ssh $USER@$HOST << 'ENDSSH'
cd ~

echo "1. Fixing .bashrc syntax error..."
# Check what's wrong
echo "Checking .bashrc around line 119:"
sed -n '115,125p' ~/.bashrc 2>/dev/null || echo "Could not read .bashrc"

# Fix by removing orphaned if/fi statements
# First, let's see the problematic area
echo ""
echo "Current .bashrc structure:"
grep -n "if\|fi" ~/.bashrc | tail -10

# Restore from backup if available, then clean it properly
if [ -f ~/.bashrc.backup ]; then
    echo ""
    echo "Restoring from backup and cleaning properly..."
    cp ~/.bashrc.backup ~/.bashrc
    # Remove the javs section more carefully
    sed -i '/# javs自启动/,/nohup.*javs.*daemonized/d' ~/.bashrc
    # Remove any orphaned if/fi statements
    sed -i '/^[[:space:]]*if[[:space:]]*$/d' ~/.bashrc
    sed -i '/^[[:space:]]*fi[[:space:]]*$/d' ~/.bashrc
    echo "✅ .bashrc fixed"
else
    echo "No backup found, manually fixing..."
    # Remove lines around 119 that might be broken
    sed -i '115,125d' ~/.bashrc 2>/dev/null || echo "Could not delete lines"
fi

# Test .bashrc syntax
bash -n ~/.bashrc && echo "✅ .bashrc syntax is now valid" || echo "❌ Still has syntax errors"

echo ""
echo "2. Investigating malware entry point..."
echo ""

echo "SSH Login History (last 50 logins):"
sudo last -50 2>/dev/null | head -50 || last -50 | head -50

echo ""
echo "Failed SSH Login Attempts (brute force evidence):"
sudo grep "Failed password" /var/log/auth.log 2>/dev/null | tail -30 || \
sudo grep "Failed password" /var/log/secure 2>/dev/null | tail -30 || \
echo "Could not access auth logs (may need sudo)"

echo ""
echo "Unique IPs that logged in:"
sudo last -50 2>/dev/null | awk '{print $3}' | grep -v "^$" | sort | uniq -c | sort -rn | head -10 || \
last -50 | awk '{print $3}' | grep -v "^$" | sort | uniq -c | sort -rn | head -10

echo ""
echo "When was .bashrc backup created (malware installation time)?"
if [ -f ~/.bashrc.backup ]; then
    stat -c "%y" ~/.bashrc.backup 2>/dev/null || stat -f "%Sm" ~/.bashrc.backup 2>/dev/null
    echo ""
    echo "Backup file size:"
    ls -lh ~/.bashrc.backup
fi

echo ""
echo "Checking for gaganode/nezha process:"
ps aux | grep -E "(gaganode|nezha)" | grep -v grep || echo "✅ No gaganode/nezha processes"

if [ -d "/opt/nezha" ]; then
    echo ""
    echo "⚠️  /opt/nezha directory exists!"
    echo "When was it created?"
    stat -c "%y" /opt/nezha 2>/dev/null || stat -f "%Sm" /opt/nezha 2>/dev/null
    echo ""
    echo "Contents:"
    ls -la /opt/nezha/ 2>/dev/null | head -10
fi

echo ""
echo "Bash history (checking for installation commands):"
history | tail -100 | grep -E "(wget|curl|bash|sh|\.sh|http|https|javs|miner|nezha|gaganode)" | tail -20 || echo "No suspicious commands in recent history"

echo ""
echo "Checking authorized SSH keys:"
if [ -f ~/.ssh/authorized_keys ]; then
    echo "Number of keys: $(wc -l < ~/.ssh/authorized_keys)"
    echo "When was it modified?"
    stat -c "%y" ~/.ssh/authorized_keys 2>/dev/null || stat -f "%Sm" ~/.ssh/authorized_keys 2>/dev/null
    echo ""
    echo "Keys:"
    cat ~/.ssh/authorized_keys
fi

echo ""
echo "✅ Investigation complete!"
echo ""
echo "Key findings will show:"
echo "- When unauthorized logins occurred"
echo "- Which IP addresses accessed the server"
echo "- When malware was installed"
ENDSSH

