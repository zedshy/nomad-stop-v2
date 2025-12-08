#!/bin/bash

# 🚨 URGENT SECURITY FIX - Run this IMMEDIATELY on VPS
# This script will:
# 1. Block the malicious IP address
# 2. Find and remove malicious cron jobs
# 3. Kill malicious processes
# 4. Find and remove malicious files
# 5. Secure the server

echo "🚨 URGENT SECURITY FIX - Starting..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Malicious IP to block
MALICIOUS_IP="176.117.107.158"

echo "1️⃣  BLOCKING MALICIOUS IP: $MALICIOUS_IP"
sudo ufw deny from $MALICIOUS_IP
sudo iptables -A INPUT -s $MALICIOUS_IP -j DROP
echo -e "${GREEN}✅ IP blocked${NC}"
echo ""

echo "2️⃣  CHECKING FOR MALICIOUS CRON JOBS"
echo "User cron jobs:"
crontab -l 2>/dev/null | grep -E "176\.117\.107\.158|wget.*r\.sh|curl.*r\.sh|/tmp/.*\.sh" && {
    echo -e "${RED}❌ MALICIOUS CRON JOB FOUND!${NC}"
    crontab -l > /tmp/cron_backup_$(date +%Y%m%d_%H%M%S)
    crontab -r
    echo -e "${GREEN}✅ Removed all user cron jobs${NC}"
} || echo -e "${GREEN}✅ No malicious user cron jobs found${NC}"

echo ""
echo "Root cron jobs:"
sudo crontab -l 2>/dev/null | grep -E "176\.117\.107\.158|wget.*r\.sh|curl.*r\.sh|/tmp/.*\.sh" && {
    echo -e "${RED}❌ MALICIOUS ROOT CRON JOB FOUND!${NC}"
    sudo crontab -l > /tmp/root_cron_backup_$(date +%Y%m%d_%H%M%S)
    sudo crontab -r
    echo -e "${GREEN}✅ Removed all root cron jobs${NC}"
} || echo -e "${GREEN}✅ No malicious root cron jobs found${NC}"
echo ""

echo "3️⃣  KILLING MALICIOUS PROCESSES"
# Kill any processes downloading from malicious IP
ps aux | grep -E "wget.*176\.117\.107\.158|curl.*176\.117\.107\.158|r\.sh|/tmp/bot" | grep -v grep | awk '{print $2}' | while read pid; do
    echo -e "${YELLOW}Killing process $pid${NC}"
    sudo kill -9 $pid 2>/dev/null
done
echo -e "${GREEN}✅ Malicious processes killed${NC}"
echo ""

echo "4️⃣  FINDING AND REMOVING MALICIOUS FILES"
# Find malicious files
find /tmp -name "r.sh" -o -name "bot*" 2>/dev/null | while read file; do
    echo -e "${YELLOW}Removing: $file${NC}"
    sudo rm -f "$file"
done

find /var/tmp -name "r.sh" -o -name "bot*" 2>/dev/null | while read file; do
    echo -e "${YELLOW}Removing: $file${NC}"
    sudo rm -f "$file"
done

find /home/nomadadmin -name "r.sh" -o -name "bot*" 2>/dev/null | while read file; do
    echo -e "${YELLOW}Removing: $file${NC}"
    sudo rm -f "$file"
done
echo -e "${GREEN}✅ Malicious files removed${NC}"
echo ""

echo "5️⃣  CHECKING SYSTEMD SERVICES"
# Check for malicious systemd services
sudo systemctl list-units --type=service --all | grep -E "bot|miner|176\.117" && {
    echo -e "${RED}❌ SUSPICIOUS SYSTEMD SERVICE FOUND!${NC}"
    sudo systemctl list-units --type=service --all | grep -E "bot|miner|176\.117"
} || echo -e "${GREEN}✅ No suspicious systemd services${NC}"
echo ""

echo "6️⃣  SECURING /tmp DIRECTORY"
# Make /tmp more secure (but still writable)
sudo chmod 1777 /tmp
echo -e "${GREEN}✅ /tmp secured${NC}"
echo ""

echo "7️⃣  CHECKING FOR COMPROMISED FILES IN APP"
cd /var/www/nomad-stop
# Check for suspicious files
find . -name "*.sh" -o -name "r.sh" -o -name "bot*" 2>/dev/null | while read file; do
    if ! git ls-files --error-unmatch "$file" >/dev/null 2>&1; then
        echo -e "${YELLOW}Suspicious file (not in git): $file${NC}"
        # Check if it contains malicious code
        if grep -q "176\.117\.107\.158\|wget.*r\.sh\|curl.*r\.sh" "$file" 2>/dev/null; then
            echo -e "${RED}❌ MALICIOUS FILE FOUND: $file${NC}"
            sudo rm -f "$file"
            echo -e "${GREEN}✅ Removed malicious file${NC}"
        fi
    fi
done
echo ""

echo "8️⃣  RESTARTING PM2 (to clear any injected code)"
pm2 restart nomad-stop
echo -e "${GREEN}✅ PM2 restarted${NC}"
echo ""

echo "9️⃣  VERIFICATION"
echo "Checking for remaining malicious processes:"
ps aux | grep -E "wget.*176\.117|curl.*176\.117|r\.sh|/tmp/bot" | grep -v grep && {
    echo -e "${RED}❌ STILL FOUND MALICIOUS PROCESSES!${NC}"
} || echo -e "${GREEN}✅ No malicious processes running${NC}"

echo ""
echo "Checking firewall rules:"
sudo ufw status | grep -E "$MALICIOUS_IP|176\.117" && echo -e "${GREEN}✅ IP is blocked${NC}" || echo -e "${YELLOW}⚠️  IP might not be blocked in UFW (check iptables)${NC}"
echo ""

echo "🔟  RECOMMENDATIONS"
echo -e "${YELLOW}1. Change all passwords immediately${NC}"
echo -e "${YELLOW}2. Review all cron jobs: crontab -l${NC}"
echo -e "${YELLOW}3. Review systemd services: sudo systemctl list-units --type=service${NC}"
echo -e "${YELLOW}4. Check application logs for injection points${NC}"
echo -e "${YELLOW}5. Consider reinstalling the application from clean git repo${NC}"
echo ""

echo -e "${GREEN}✅ Security fix complete!${NC}"
echo "Monitor logs: pm2 logs nomad-stop --lines 50"

