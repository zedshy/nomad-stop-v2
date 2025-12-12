# 🚨 SECURITY ALERT - Server Compromised

## Critical Issues Found

1. **PM2 Service Not Running**: Service is enabled but inactive
2. **Server Compromised**: Malicious scripts detected in logs
3. **Malware Attempts**: Cryptocurrency miners trying to execute

## Immediate Actions Required

### Step 1: Fix PM2 Service (Do This First)

```bash
cd /var/www/nomad-stop

# Start PM2 manually
pm2 start ecosystem.config.js
pm2 save

# Check if service is actually running
sudo systemctl start pm2-nomadadmin.service
sudo systemctl status pm2-nomadadmin.service
```

### Step 2: Security Cleanup (URGENT)

```bash
# Check for malicious processes
ps aux | grep -E "xmrig|solrk|miner|curl.*154.23|wget.*154.23"

# Check for suspicious files
find /tmp -name "*react*" -o -name "*miner*" -o -name "*xmrig*" 2>/dev/null
ls -la /tmp/ | grep -E "sh$|script"

# Check for suspicious network connections
sudo netstat -tulpn | grep -E "666|443.*45.134"

# Check cron jobs for malicious entries
crontab -l
sudo crontab -l
cat /etc/crontab
ls -la /etc/cron.d/
ls -la /etc/cron.hourly/
ls -la /etc/cron.daily/
```

### Step 3: Check for Backdoors

```bash
# Check for suspicious SSH keys
cat ~/.ssh/authorized_keys
sudo cat /root/.ssh/authorized_keys

# Check for suspicious users
cat /etc/passwd | grep -E "bash|sh$"

# Check system logs for unauthorized access
sudo last | head -20
sudo grep "Failed password" /var/log/auth.log | tail -20
```

### Step 4: Secure the Server

```bash
# Change all passwords immediately
# Update SSH keys
# Review firewall rules
sudo ufw status
```

## Why PM2 Keeps Stopping

The PM2 systemd service is **enabled but not actually running**. This means:
- It's configured to start on boot
- But it's currently inactive/dead
- It's not actually starting your app

## Long-term Fix

1. **Fix PM2 Service**:
```bash
# Make sure service actually runs
sudo systemctl enable pm2-nomadadmin.service
sudo systemctl start pm2-nomadadmin.service
sudo systemctl status pm2-nomadadmin.service
```

2. **Secure the Server** (after cleanup):
- Change all passwords
- Update SSH keys
- Review firewall
- Consider reinstalling if heavily compromised
- Update all software
- Review application code for vulnerabilities

## Next Steps

1. Fix PM2 immediately (commands above)
2. Run security checks
3. Clean up malicious files
4. Change all credentials
5. Review how the server was compromised
6. Consider professional security audit


