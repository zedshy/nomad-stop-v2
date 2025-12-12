#!/bin/bash
# Security Audit and Cleanup Script
# Run on VPS: cd /var/www/nomad-stop && bash security-audit-and-cleanup.sh

echo "🔒 SECURITY AUDIT AND CLEANUP"
echo "============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

THREATS_FOUND=0

echo "1️⃣  CHECKING FOR MALICIOUS PROCESSES"
echo "--------------------------------------"
MALICIOUS_PROCS=$(ps aux | grep -E "xmrig|solrk|miner|\.0ql6uqw4|requestrepo|154\.23\.172|45\.134\.174" | grep -v grep)
if [ -n "$MALICIOUS_PROCS" ]; then
    echo -e "${RED}❌ MALICIOUS PROCESSES FOUND:${NC}"
    echo "$MALICIOUS_PROCS"
    THREATS_FOUND=$((THREATS_FOUND + 1))
    echo ""
    echo "Kill these processes? (y/n)"
    read -r response
    if [ "$response" = "y" ]; then
        echo "$MALICIOUS_PROCS" | awk '{print $2}' | xargs sudo kill -9 2>/dev/null
        echo -e "${GREEN}✅ Processes killed${NC}"
    fi
else
    echo -e "${GREEN}✅ No malicious processes found${NC}"
fi
echo ""

echo "2️⃣  CHECKING /tmp FOR MALICIOUS FILES"
echo "--------------------------------------"
MALICIOUS_FILES=$(find /tmp -type f \( -name "*react*" -o -name "*miner*" -o -name "*xmrig*" -o -name "*solrk*" -o -name "*upgrade*" -o -name "*.0ql6uqw4*" \) 2>/dev/null)
if [ -n "$MALICIOUS_FILES" ]; then
    echo -e "${RED}❌ MALICIOUS FILES FOUND IN /tmp:${NC}"
    echo "$MALICIOUS_FILES"
    THREATS_FOUND=$((THREATS_FOUND + 1))
    echo ""
    echo "Delete these files? (y/n)"
    read -r response
    if [ "$response" = "y" ]; then
        echo "$MALICIOUS_FILES" | xargs sudo rm -f 2>/dev/null
        echo -e "${GREEN}✅ Files deleted${NC}"
    fi
else
    echo -e "${GREEN}✅ No malicious files in /tmp${NC}"
fi
echo ""

echo "3️⃣  CHECKING CRON JOBS"
echo "----------------------"
echo "User cron jobs:"
USER_CRON=$(crontab -l 2>/dev/null)
if [ -n "$USER_CRON" ]; then
    echo "$USER_CRON"
    SUSPICIOUS_CRON=$(echo "$USER_CRON" | grep -E "curl.*154\.23|wget.*154\.23|154\.23\.172|45\.134\.174|\.0ql6uqw4|requestrepo|/tmp/.*\.sh")
    if [ -n "$SUSPICIOUS_CRON" ]; then
        echo -e "${RED}❌ SUSPICIOUS CRON ENTRIES FOUND:${NC}"
        echo "$SUSPICIOUS_CRON"
        THREATS_FOUND=$((THREATS_FOUND + 1))
    fi
else
    echo -e "${GREEN}✅ No user cron jobs${NC}"
fi
echo ""

echo "Root cron jobs:"
ROOT_CRON=$(sudo crontab -l 2>/dev/null)
if [ -n "$ROOT_CRON" ]; then
    echo "$ROOT_CRON"
    SUSPICIOUS_ROOT_CRON=$(echo "$ROOT_CRON" | grep -E "curl.*154\.23|wget.*154\.23|154\.23\.172|45\.134\.174|\.0ql6uqw4|requestrepo|/tmp/.*\.sh")
    if [ -n "$SUSPICIOUS_ROOT_CRON" ]; then
        echo -e "${RED}❌ SUSPICIOUS ROOT CRON ENTRIES FOUND:${NC}"
        echo "$SUSPICIOUS_ROOT_CRON"
        THREATS_FOUND=$((THREATS_FOUND + 1))
    fi
else
    echo -e "${GREEN}✅ No root cron jobs${NC}"
fi
echo ""

echo "System cron directories:"
for dir in /etc/cron.d /etc/cron.hourly /etc/cron.daily /etc/cron.weekly /etc/cron.monthly; do
    if [ -d "$dir" ]; then
        SUSPICIOUS_SYS_CRON=$(find "$dir" -type f -exec grep -l "154\.23\|45\.134\|\.0ql6uqw4\|requestrepo" {} \; 2>/dev/null)
        if [ -n "$SUSPICIOUS_SYS_CRON" ]; then
            echo -e "${RED}❌ SUSPICIOUS FILES IN $dir:${NC}"
            echo "$SUSPICIOUS_SYS_CRON"
            THREATS_FOUND=$((THREATS_FOUND + 1))
        fi
    fi
done
echo ""

echo "4️⃣  CHECKING SUSPICIOUS NETWORK CONNECTIONS"
echo "-------------------------------------------"
SUSPICIOUS_CONN=$(sudo netstat -tulpn 2>/dev/null | grep -E "154\.23\.172|45\.134\.174|:666|:9004")
if [ -n "$SUSPICIOUS_CONN" ]; then
    echo -e "${RED}❌ SUSPICIOUS NETWORK CONNECTIONS:${NC}"
    echo "$SUSPICIOUS_CONN"
    THREATS_FOUND=$((THREATS_FOUND + 1))
else
    echo -e "${GREEN}✅ No suspicious network connections${NC}"
fi
echo ""

echo "5️⃣  CHECKING SSH AUTHORIZED KEYS"
echo "--------------------------------"
echo "User authorized keys:"
if [ -f ~/.ssh/authorized_keys ]; then
    cat ~/.ssh/authorized_keys
    KEY_COUNT=$(wc -l < ~/.ssh/authorized_keys)
    echo "Total keys: $KEY_COUNT"
    if [ "$KEY_COUNT" -gt 5 ]; then
        echo -e "${YELLOW}⚠️  Many SSH keys found - review them${NC}"
    fi
else
    echo -e "${GREEN}✅ No authorized_keys file${NC}"
fi
echo ""

echo "Root authorized keys:"
if sudo test -f /root/.ssh/authorized_keys; then
    sudo cat /root/.ssh/authorized_keys
    ROOT_KEY_COUNT=$(sudo wc -l < /root/.ssh/authorized_keys)
    echo "Total keys: $ROOT_KEY_COUNT"
    if [ "$ROOT_KEY_COUNT" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Root has SSH keys - review them${NC}"
    fi
else
    echo -e "${GREEN}✅ No root authorized_keys file${NC}"
fi
echo ""

echo "6️⃣  CHECKING RECENT LOGIN ATTEMPTS"
echo "---------------------------------"
echo "Recent failed login attempts:"
sudo grep "Failed password" /var/log/auth.log 2>/dev/null | tail -20 | awk '{print $1, $2, $3, $11, $13}' | sort | uniq -c | sort -rn
echo ""

echo "Recent successful logins:"
last | head -20
echo ""

echo "7️⃣  CHECKING FOR SUSPICIOUS USERS"
echo "----------------------------------"
echo "Users with shell access:"
cat /etc/passwd | grep -E "/bin/(bash|sh)$" | awk -F: '{print $1, $3, $6}'
echo ""

echo "8️⃣  CHECKING APPLICATION LOGS FOR INJECTIONS"
echo "--------------------------------------------"
if [ -f /var/www/nomad-stop/logs/err.log ]; then
    echo "Checking for command injection attempts in app logs:"
    INJECTION_ATTEMPTS=$(grep -E "curl.*154\.23|wget.*154\.23|154\.23\.172|45\.134\.174|\.0ql6uqw4|requestrepo|/tmp/.*\.sh|base64.*bash" /var/www/nomad-stop/logs/err.log 2>/dev/null | wc -l)
    if [ "$INJECTION_ATTEMPTS" -gt 0 ]; then
        echo -e "${RED}❌ Found $INJECTION_ATTEMPTS injection attempts in logs${NC}"
        echo "These are likely from malicious requests to your application"
        THREATS_FOUND=$((THREATS_FOUND + 1))
    else
        echo -e "${GREEN}✅ No recent injection attempts in logs${NC}"
    fi
fi
echo ""

echo "9️⃣  CHECKING FIREWALL STATUS"
echo "---------------------------"
if command -v ufw >/dev/null 2>&1; then
    sudo ufw status verbose
else
    echo -e "${YELLOW}⚠️  UFW not installed${NC}"
fi
echo ""

echo "🔟 CHECKING SYSTEM UPDATES"
echo "-------------------------"
echo "Checking for security updates:"
if [ -f /usr/lib/update-notifier/update-motd-updates-available ]; then
    /usr/lib/update-notifier/update-motd-updates-available 2>/dev/null || echo "No update info available"
else
    echo "Run: sudo apt update && sudo apt list --upgradable"
fi
echo ""

echo "===================================="
echo "📋 SECURITY AUDIT SUMMARY"
echo "===================================="
echo ""
if [ $THREATS_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ No active threats detected${NC}"
    echo ""
    echo "However, the logs show past injection attempts."
    echo "This means your application may have vulnerabilities."
else
    echo -e "${RED}🔴 $THREATS_FOUND THREAT(S) DETECTED${NC}"
    echo ""
    echo "Review the findings above and take action."
fi
echo ""

echo "🛡️  RECOMMENDED SECURITY ACTIONS:"
echo ""
echo "1. Change all passwords (SSH, database, application)"
echo "2. Rotate SSH keys"
echo "3. Review and update firewall rules"
echo "4. Update all system packages: sudo apt update && sudo apt upgrade"
echo "5. Review application code for vulnerabilities (especially command execution)"
echo "6. Enable fail2ban: sudo apt install fail2ban"
echo "7. Review application logs regularly"
echo "8. Consider using a WAF (Web Application Firewall)"
echo "9. Review .env file - ensure no sensitive data is exposed"
echo "10. Check application for code injection vulnerabilities"
echo ""


