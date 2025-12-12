# 🚨 URGENT: Active Cryptocurrency Miner Detected

## Critical Finding

**Active miner process found:**
- Process ID: 365471
- Running as: root
- Location: `/home/nomadadmin/c3pool/xmrig`
- CPU Usage: 58.3%
- Memory: 14% (282MB)
- Running since: Dec 5

## IMMEDIATE ACTIONS (Run These Now)

### Step 1: Kill the Miner Process

```bash
# Kill the miner process
sudo kill -9 365471

# Verify it's gone
ps aux | grep xmrig | grep -v grep
```

### Step 2: Remove Miner Files

```bash
# Remove the miner directory
sudo rm -rf /home/nomadadmin/c3pool

# Remove malicious script from /tmp
sudo rm -f /tmp/apl.sh

# Clean up any other malicious files
sudo find /tmp -type f \( -name "*react*" -o -name "*miner*" -o -name "*xmrig*" -o -name "*solrk*" \) -delete 2>/dev/null
```

### Step 3: Check for Persistence

```bash
# Check if miner is in cron
crontab -l
sudo crontab -l
grep -r "c3pool\|xmrig" /etc/cron.* 2>/dev/null

# Check systemd services
systemctl list-units --type=service | grep -i c3pool
systemctl list-units --type=service | grep -i xmrig
systemctl list-units --type=service | grep -i miner

# Check for startup scripts
ls -la /etc/init.d/ | grep -i c3pool
ls -la ~/.config/autostart/ 2>/dev/null
```

### Step 4: Check for Other Malicious Processes

```bash
# Check all processes
ps aux | grep -E "curl|wget|bash.*154|bash.*45" | grep -v grep

# Check network connections
sudo netstat -tulpn | grep -E "154\.23|45\.134|:666"

# Check for suspicious files
find /home/nomadadmin -name "*c3pool*" -o -name "*xmrig*" 2>/dev/null
find /root -name "*c3pool*" -o -name "*xmrig*" 2>/dev/null
```

### Step 5: Secure the Server

```bash
# Change all passwords immediately
passwd
sudo passwd root

# Review SSH access
cat ~/.ssh/authorized_keys
sudo cat /root/.ssh/authorized_keys

# Install fail2ban
sudo apt update
sudo apt install -y fail2ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Update system
sudo apt upgrade -y
```

### Step 6: Check Application Vulnerabilities

The logs show command injection attempts. Review your application code for:
- Any code that executes system commands
- API endpoints that process user input
- Places where user input might be executed

## After Cleanup

1. Monitor system resources: `htop` or `top`
2. Check logs regularly: `sudo tail -f /var/log/auth.log`
3. Review application logs: `tail -f /var/www/nomad-stop/logs/err.log`
4. Consider professional security audit


