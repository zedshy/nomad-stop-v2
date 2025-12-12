#!/bin/bash
# Complete security audit - find how malware got in and prevent it

HOST="92.205.231.55"
USER="nomadadmin"

echo "🔒 Complete Security Audit"
echo "=========================="
echo ""

ssh $USER@$HOST << 'ENDSSH'
cd /var/www/nomad-stop

echo "=== PART 1: MALWARE DETECTION ==="
echo ""
echo "1. Current malware status:"
ps aux | grep -E "(javs|miner|xmrig|stratum)" | grep -v grep || echo "✅ No malware processes"
ls -la /home/nomadadmin/.javs 2>/dev/null || echo "✅ .javs directory removed"

echo ""
echo "=== PART 2: SSH SECURITY ==="
echo ""
echo "2. Recent SSH logins (last 30):"
sudo last -30 2>/dev/null | head -30 || echo "Could not access login history"

echo ""
echo "3. Failed login attempts:"
sudo grep "Failed password" /var/log/auth.log 2>/dev/null | tail -20 || echo "Could not access auth log"

echo ""
echo "4. SSH configuration:"
echo "Password authentication:"
sudo grep -E "^PasswordAuthentication" /etc/ssh/sshd_config 2>/dev/null || echo "Using default (may allow passwords)"
echo "Root login:"
sudo grep -E "^PermitRootLogin" /etc/ssh/sshd_config 2>/dev/null || echo "Using default"

echo ""
echo "5. Authorized SSH keys:"
if [ -f ~/.ssh/authorized_keys ]; then
    echo "Number of keys: $(wc -l < ~/.ssh/authorized_keys)"
    echo "Keys:"
    cat ~/.ssh/authorized_keys
else
    echo "No authorized_keys file"
fi

echo ""
echo "=== PART 3: SUSPICIOUS PROCESSES & SERVICES ==="
echo ""
echo "6. All running processes (checking for suspicious names):"
ps aux | grep -E "(miner|java|javs|xmrig|stratum|gaganode|nezha)" | grep -v grep || echo "✅ No suspicious processes"

echo ""
echo "7. Systemd services:"
systemctl list-units --type=service --all | grep -E "(javs|miner|stratum|xmrig|gaganode)" || echo "✅ No suspicious services"

echo ""
echo "8. Systemd timers:"
systemctl list-timers --all | grep -E "(javs|miner)" || echo "✅ No suspicious timers"

echo ""
echo "=== PART 4: CRON JOBS ==="
echo ""
echo "9. User crontab:"
crontab -l 2>/dev/null || echo "No user crontab"
echo ""
echo "10. Root crontab:"
sudo crontab -l 2>/dev/null || echo "No root crontab"
echo ""
echo "11. System cron directories:"
ls -la /etc/cron.d/ 2>/dev/null | head -10 || echo "Could not access /etc/cron.d"
ls -la /etc/cron.daily/ 2>/dev/null | head -10 || echo "Could not access /etc/cron.daily"

echo ""
echo "=== PART 5: FILE SYSTEM INVESTIGATION ==="
echo ""
echo "12. Suspicious files in home directory:"
find ~ -maxdepth 3 -type f \( -name "*javs*" -o -name "*miner*" -o -name "*xmrig*" \) 2>/dev/null

echo ""
echo "13. Large files in home directory (>10MB):"
find ~ -type f -size +10M 2>/dev/null | head -10

echo ""
echo "14. Recently modified files in home (last 7 days):"
find ~ -type f -mtime -7 2>/dev/null | grep -v ".pm2" | grep -v ".npm" | head -20

echo ""
echo "=== PART 6: NETWORK & CONNECTIONS ==="
echo ""
echo "15. Active network connections:"
sudo netstat -tulnp 2>/dev/null | grep -E "(ESTABLISHED|LISTEN)" | grep -v "127.0.0.1" | head -15 || echo "Could not check connections"

echo ""
echo "16. Outbound connections:"
sudo ss -tuln 2>/dev/null | grep ESTAB | head -10 || echo "Could not check connections"

echo ""
echo "=== PART 7: INSTALLATION METHODS ==="
echo ""
echo "17. Bash history (checking for suspicious downloads):"
history | grep -E "(wget|curl)" | grep -E "(\.sh|http|https)" | tail -20 || echo "No suspicious downloads in history"

echo ""
echo "18. Checking for installation scripts:"
find /tmp /var/tmp -name "*.sh" -mtime -30 2>/dev/null | head -10

echo ""
echo "=== PART 8: PACKAGE & DEPENDENCY SECURITY ==="
echo ""
echo "19. Checking package.json for suspicious packages:"
if [ -f /var/www/nomad-stop/package.json ]; then
    grep -E "(javs|miner|xmrig|stratum|postinstall)" /var/www/nomad-stop/package.json || echo "✅ No suspicious packages"
fi

echo ""
echo "20. Checking npm scripts for suspicious commands:"
if [ -f /var/www/nomad-stop/package.json ]; then
    grep -A 20 '"scripts"' /var/www/nomad-stop/package.json | grep -E "(wget|curl|sh -c|bash -c)" || echo "✅ No suspicious scripts"
fi

echo ""
echo "=== PART 9: SYSTEM VULNERABILITIES ==="
echo ""
echo "21. System updates available:"
apt list --upgradable 2>/dev/null | head -10 || echo "Could not check updates"

echo ""
echo "22. Open ports:"
sudo netstat -tuln 2>/dev/null | grep LISTEN | head -15 || echo "Could not check ports"

echo ""
echo "=== PART 10: OTHER USER ACCOUNTS ==="
echo ""
echo "23. Users with shell access:"
cat /etc/passwd | grep -E "/(bash|sh)$" | grep -v "nologin"

echo ""
echo "24. Users with sudo access:"
sudo grep -E "^[^#].*ALL" /etc/sudoers 2>/dev/null | head -10 || echo "Could not check sudoers"

echo ""
echo "=== PART 11: ENVIRONMENT VARIABLES ==="
echo ""
echo "25. Suspicious environment variables:"
env | grep -E "(JAVS|MINER|XMRIG|STRATUM)" || echo "✅ No suspicious env vars"

echo ""
echo "=== PART 12: LOG ANALYSIS ==="
echo ""
echo "26. Recent system log entries (suspicious activity):"
sudo journalctl --since "7 days ago" | grep -E "(javs|miner|unauthorized|failed|error)" | tail -20 || echo "Could not access logs"

echo ""
echo "=== SUMMARY ==="
echo ""
echo "✅ Security audit complete!"
echo ""
echo "Key things to check:"
echo "1. SSH access logs - look for unauthorized logins"
echo "2. Failed login attempts - may indicate brute force"
echo "3. Suspicious cron jobs or systemd services"
echo "4. Network connections to unknown IPs"
echo "5. Recently modified files"
ENDSSH

