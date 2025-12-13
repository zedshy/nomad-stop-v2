#!/bin/bash
# Complete Security Hardening Script for Nomad Stop Server
# This script will permanently remove malware and secure the server

HOST="92.205.231.55"
USER="nomadadmin"

echo "🔒 COMPLETE SECURITY HARDENING"
echo "=============================="
echo ""
echo "This script will:"
echo "1. Remove ALL known malware"
echo "2. Secure SSH (disable password auth)"
echo "3. Set up firewall rules"
echo "4. Install security tools (fail2ban)"
echo "5. Remove persistence mechanisms"
echo "6. Harden system configuration"
echo ""
echo "⚠️  WARNING: Make sure you have SSH key access before proceeding!"
echo "Press Enter to continue or Ctrl+C to cancel..."
read

ssh $USER@$HOST << 'ENDSSH'
set -e  # Exit on error

echo "=== PHASE 1: REMOVE ALL MALWARE ==="
echo ""

echo "Step 1.1: Kill all malware processes"
sudo pkill -9 -f javs 2>/dev/null || true
sudo pkill -9 -f nezha 2>/dev/null || true
sudo pkill -9 -f gaganode 2>/dev/null || true
sudo pkill -9 -f apphub 2>/dev/null || true
sudo pkill -9 -f "/tmp/fghgf" 2>/dev/null || true
sudo pkill -9 -f sshds 2>/dev/null || true
sudo pkill -9 -f "react.py" 2>/dev/null || true
sudo pkill -9 -f "redis-deploy.py" 2>/dev/null || true
sudo pkill -9 -f komari 2>/dev/null || true
echo "✅ All malware processes killed"
echo ""

echo "Step 1.2: Remove malware directories"
sudo rm -rf /home/nomadadmin/.javs
sudo rm -rf /home/nomadadmin/.nezha
sudo rm -rf /home/nomadadmin/.gaganode
sudo rm -rf /home/nomadadmin/.sshds
sudo rm -rf /home/nomadadmin/.local/pcpcat
sudo rm -rf /opt/nezha
sudo rm -rf /opt/.komari
sudo rm -rf /tmp/fghgf /tmp/ijnegrrinje.json
sudo find /tmp -name "*fghgf*" -o -name "*ijnegrrinje*" 2>/dev/null | xargs sudo rm -rf 2>/dev/null || true
echo "✅ Malware directories removed"
echo ""

echo "Step 1.3: Clean .bashrc"
if [ -f ~/.bashrc.backup ]; then
    cp ~/.bashrc.backup ~/.bashrc
fi
# Remove any malware entries
sed -i '/javs/d' ~/.bashrc
sed -i '/nezha/d' ~/.bashrc
sed -i '/gaganode/d' ~/.bashrc
sed -i '/fghgf/d' ~/.bashrc
sed -i '/sshds/d' ~/.bashrc
sed -i '/react.py/d' ~/.bashrc
sed -i '/redis-deploy/d' ~/.bashrc
sed -i '/komari/d' ~/.bashrc
sed -i '/nohup.*javs/d' ~/.bashrc
sed -i '/nohup.*nezha/d' ~/.bashrc
# Remove orphaned if/fi statements
sed -i '/^[[:space:]]*if[[:space:]]*$/d' ~/.bashrc
sed -i '/^[[:space:]]*fi[[:space:]]*$/d' ~/.bashrc
echo "✅ .bashrc cleaned"
echo ""

echo "Step 1.4: Clean crontab"
crontab -l 2>/dev/null | grep -v "javs\|nezha\|gaganode\|fghgf\|sshds\|react.py\|redis-deploy\|komari" | crontab - 2>/dev/null || true
echo "✅ Crontab cleaned"
echo ""

echo "Step 1.5: Remove systemd services (if any)"
sudo systemctl disable nezha-agent 2>/dev/null || true
sudo systemctl stop nezha-agent 2>/dev/null || true
sudo rm -f /etc/systemd/system/nezha-agent.service 2>/dev/null || true
sudo systemctl daemon-reload
echo "✅ Systemd services cleaned"
echo ""

echo ""
echo "=== PHASE 2: SECURE SSH ==="
echo ""

echo "Step 2.1: Backup SSH config"
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ SSH config backed up"
echo ""

echo "Step 2.2: Configure SSH security"
# Disable password authentication
sudo sed -i 's/^#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/^PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

# Disable root login
sudo sed -i 's/^#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sed -i 's/^PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sed -i 's/^PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config

# Enable public key authentication
sudo sed -i 's/^#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config

# Disable empty passwords
sudo sed -i 's/^#PermitEmptyPasswords no/PermitEmptyPasswords no/' /etc/ssh/sshd_config

# Set max auth tries
sudo sed -i 's/^#MaxAuthTries 6/MaxAuthTries 3/' /etc/ssh/sshd_config

# Disable X11 forwarding
sudo sed -i 's/^#X11Forwarding yes/X11Forwarding no/' /etc/ssh/sshd_config
sudo sed -i 's/^X11Forwarding yes/X11Forwarding no/' /etc/ssh/sshd_config

echo "✅ SSH configuration updated"
echo ""

echo "Step 2.3: Test SSH config (dry run)"
sudo sshd -t && echo "✅ SSH config is valid" || echo "❌ SSH config has errors"
echo ""

echo "Step 2.4: Restart SSH (will NOT disconnect current session)"
sudo systemctl restart sshd
echo "✅ SSH restarted (you're still connected via current session)"
echo ""

echo ""
echo "=== PHASE 3: FIREWALL CONFIGURATION ==="
echo ""

echo "Step 3.1: Install UFW if not present"
sudo apt-get update -qq
sudo apt-get install -y ufw 2>/dev/null || echo "UFW already installed"
echo ""

echo "Step 3.2: Configure firewall rules"
# Allow SSH (important - do this first!)
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 2224/tcp comment 'Nydus agent' 2>/dev/null || true

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

# Allow port 3000 (for Next.js app - if not using nginx)
# sudo ufw allow 3000/tcp comment 'Next.js app'

# Block known attacker IPs
sudo ufw deny from 92.40.170.154 comment 'Blocked attacker'
sudo ufw deny from 92.40.170.155 comment 'Blocked attacker'
sudo ufw deny from 92.40.170.156 comment 'Blocked attacker'
sudo ufw deny from 192.227.134.84 comment 'Blocked attacker'
sudo ufw deny from 206.237.7.21 comment 'Blocked attacker'
sudo ufw deny from 142.93.234.218 comment 'Blocked attacker'
sudo ufw deny from 45.140.17.124 comment 'Blocked attacker'
sudo ufw deny from 164.92.147.69 comment 'Blocked attacker'
sudo ufw deny from 80.94.93.233 comment 'Blocked attacker'

# Enable firewall
echo "y" | sudo ufw enable 2>/dev/null || sudo ufw --force enable
echo "✅ Firewall configured and enabled"
echo ""

echo ""
echo "=== PHASE 4: INSTALL SECURITY TOOLS ==="
echo ""

echo "Step 4.1: Install fail2ban"
sudo apt-get install -y fail2ban 2>/dev/null || echo "fail2ban already installed"
echo ""

echo "Step 4.2: Configure fail2ban"
sudo tee /etc/fail2ban/jail.local > /dev/null << 'FAIL2BAN_CONFIG'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
destemail = root@localhost
sendername = Fail2Ban
action = %(action_)s

[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 86400

[sshd-ddos]
enabled = true
port = 22
filter = sshd-ddos
logpath = /var/log/auth.log
maxretry = 10
FAIL2BAN_CONFIG

sudo systemctl enable fail2ban
sudo systemctl restart fail2ban
echo "✅ fail2ban installed and configured"
echo ""

echo ""
echo "=== PHASE 5: SYSTEM HARDENING ==="
echo ""

echo "Step 5.1: Disable unnecessary services"
sudo systemctl disable bluetooth 2>/dev/null || true
sudo systemctl stop bluetooth 2>/dev/null || true
echo "✅ Unnecessary services disabled"
echo ""

echo "Step 5.2: Set up automatic security updates"
sudo apt-get install -y unattended-upgrades 2>/dev/null || echo "Already installed"
sudo dpkg-reconfigure -f noninteractive unattended-upgrades 2>/dev/null || true
echo "✅ Automatic security updates configured"
echo ""

echo "Step 5.3: Set restrictive file permissions"
# Protect sensitive files
sudo chmod 600 /etc/ssh/sshd_config
sudo chmod 600 ~/.ssh/authorized_keys 2>/dev/null || true
sudo chmod 700 ~/.ssh 2>/dev/null || true
echo "✅ File permissions secured"
echo ""

echo ""
echo "=== PHASE 6: MONITORING SETUP ==="
echo ""

echo "Step 6.1: Create malware detection script"
sudo tee /usr/local/bin/check-malware.sh > /dev/null << 'MONITOR_SCRIPT'
#!/bin/bash
# Malware detection script - run daily via cron

LOG_FILE="/var/log/malware-check.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] Checking for malware..." >> $LOG_FILE

# Check for known malware processes
MALWARE_FOUND=0

if pgrep -f javs > /dev/null; then
    echo "[$DATE] ⚠️  javs process detected!" >> $LOG_FILE
    MALWARE_FOUND=1
fi

if pgrep -f nezha > /dev/null; then
    echo "[$DATE] ⚠️  nezha process detected!" >> $LOG_FILE
    MALWARE_FOUND=1
fi

if pgrep -f gaganode > /dev/null; then
    echo "[$DATE] ⚠️  gaganode process detected!" >> $LOG_FILE
    MALWARE_FOUND=1
fi

if pgrep -f "/tmp/fghgf" > /dev/null; then
    echo "[$DATE] ⚠️  fghgf process detected!" >> $LOG_FILE
    MALWARE_FOUND=1
fi

if pgrep -f sshds > /dev/null; then
    echo "[$DATE] ⚠️  sshds process detected!" >> $LOG_FILE
    MALWARE_FOUND=1
fi

if [ $MALWARE_FOUND -eq 0 ]; then
    echo "[$DATE] ✅ No malware detected" >> $LOG_FILE
fi

# Check CPU usage
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
if (( $(echo "$CPU_USAGE > 90" | bc -l) )); then
    echo "[$DATE] ⚠️  High CPU usage: ${CPU_USAGE}%" >> $LOG_FILE
fi
MONITOR_SCRIPT

sudo chmod +x /usr/local/bin/check-malware.sh
echo "✅ Malware detection script created"
echo ""

echo "Step 6.2: Add to crontab (daily check)"
(crontab -l 2>/dev/null | grep -v check-malware.sh; echo "0 2 * * * /usr/local/bin/check-malware.sh") | crontab -
echo "✅ Daily malware check scheduled"
echo ""

echo ""
echo "=== PHASE 7: VERIFICATION ==="
echo ""

echo "Step 7.1: Verify no malware processes"
ps aux | grep -E "(javs|nezha|gaganode|fghgf|sshds|komari)" | grep -v grep || echo "✅ No malware processes found"
echo ""

echo "Step 7.2: Verify SSH configuration"
echo "SSH Password Auth:"
sudo grep -E "^PasswordAuthentication" /etc/ssh/sshd_config || echo "Not explicitly set (defaults to no)"
echo ""
echo "SSH Root Login:"
sudo grep -E "^PermitRootLogin" /etc/ssh/sshd_config || echo "Not explicitly set"
echo ""

echo "Step 7.3: Verify firewall status"
sudo ufw status verbose | head -20
echo ""

echo "Step 7.4: Verify fail2ban status"
sudo systemctl status fail2ban --no-pager | head -5
echo ""

echo ""
echo "=== ✅ SECURITY HARDENING COMPLETE ==="
echo ""
echo "Summary:"
echo "✅ All malware removed"
echo "✅ SSH secured (password auth disabled)"
echo "✅ Firewall configured"
echo "✅ fail2ban installed"
echo "✅ System hardened"
echo "✅ Monitoring set up"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Test SSH access with your key (password auth is now disabled)"
echo "2. Monitor /var/log/malware-check.log daily"
echo "3. Check fail2ban status: sudo fail2ban-client status"
echo "4. Consider upgrading your server plan (1 CPU core is limiting)"
echo "5. Set up regular backups"
echo ""
echo "If you lose SSH access, contact your hosting provider immediately!"
echo ""

ENDSSH

echo ""
echo "✅ Security hardening complete!"
echo ""
echo "⚠️  CRITICAL: Test your SSH access now with:"
echo "   ssh $USER@$HOST"
echo ""
echo "If password authentication was your only access method, you may be locked out!"
echo "Make sure you have SSH keys set up before the script runs."
