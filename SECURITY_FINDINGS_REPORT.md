# 🚨 Security Investigation Report

## Critical Findings

### **1. Unauthorized SSH Access - ATTACKER IDENTIFIED**

**Suspicious IP Addresses that logged in:**
- `92.40.170.154` - Nov 22, 00:01-02:14 (2 hours)
- `92.40.170.155` - Nov 21, 23:48-02:09 (2+ hours)  
- `92.40.170.156` - Nov 22, 00:21-00:39 (18 minutes)

**Timeline:**
- **Nov 21-22**: Attackers logged in from suspicious IPs
- **Dec 5-10**: `/opt/nezha` directory created (another malware/monitoring tool)
- **Dec 7-9**: Nezha processes started running
- **Dec 12**: We discovered and removed `javs` malware

### **2. Massive Brute Force Attacks**

**Attackers trying to break in (last 24 hours):**
- `192.227.134.84` - Multiple attempts
- `206.237.7.21` - Trying users: oracle, ubnt
- `142.93.234.218` - Multiple root login attempts
- `45.140.17.124` - Multiple root login attempts
- `164.92.147.69` - Multiple root login attempts
- `80.94.93.233` - Multiple root login attempts
- And many more...

**Your IP (`109.152.205.2`) also had failed login attempts** - this suggests:
- Password might have been changed/compromised
- Or you mistyped it

### **3. Additional Malware Found: Nezha/Gaganode**

**Location:** `/opt/nezha`
**Processes Running:**
- `/opt/nezha/agent/nezha-agent` (running as root, started Dec 7)
- `/opt/nezha/agent/apphub-linux-amd64/apphub` (started Dec 9)
- `/opt/nezha/agent/apphub-linux-amd64/apps/gaganode/gaganode` (started Dec 9)

**This is likely:**
- Another cryptocurrency miner
- Or a monitoring/backdoor tool
- Installed by the same attackers

### **4. Attack Vector Confirmed**

**How they got in:**
1. **Brute force attack** on SSH (password authentication enabled)
2. **Successful login** from `92.40.170.154/155/156` on Nov 21-22
3. **Installed malware:**
   - `javs` malware (cryptocurrency miner)
   - `nezha/gaganode` (additional malware/monitoring)
4. **Set up persistence:**
   - Added to `.bashrc` (auto-start on login)
   - Added to crontab (`@reboot` entry)

## Immediate Actions Required

### **1. Remove Nezha/Gaganode Malware**

```bash
# Kill nezha processes
sudo pkill -9 nezha-agent
sudo pkill -9 apphub
sudo pkill -9 gaganode

# Remove nezha directory
sudo rm -rf /opt/nezha

# Check for nezha in systemd
systemctl list-units --all | grep nezha
sudo systemctl disable nezha-agent 2>/dev/null
sudo systemctl stop nezha-agent 2>/dev/null
```

### **2. Block Attacker IPs**

```bash
# Block the attacker IPs
sudo ufw deny from 92.40.170.154
sudo ufw deny from 92.40.170.155
sudo ufw deny from 92.40.170.156

# Block other brute force IPs
sudo ufw deny from 192.227.134.84
sudo ufw deny from 206.237.7.21
sudo ufw deny from 142.93.234.218
sudo ufw deny from 45.140.17.124
sudo ufw deny from 164.92.147.69
sudo ufw deny from 80.94.93.233
```

### **3. Secure SSH (CRITICAL)**

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Change these lines:
PasswordAuthentication no
PermitRootLogin no
PubkeyAuthentication yes

# Save and restart
sudo systemctl restart sshd
```

### **4. Install Fail2Ban (Prevents Brute Force)**

```bash
sudo apt update
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### **5. Change All Passwords**

- SSH password
- Database passwords
- Any other service passwords

### **6. Fix .bashrc Syntax Error**

```bash
# Fix the broken .bashrc
if [ -f ~/.bashrc.backup ]; then
    cp ~/.bashrc.backup ~/.bashrc
    sed -i '/# javs自启动/,/nohup.*javs.*daemonized/d' ~/.bashrc
    # Remove orphaned if/fi
    sed -i '/^[[:space:]]*if[[:space:]]*$/d' ~/.bashrc
    sed -i '/^[[:space:]]*fi[[:space:]]*$/d' ~/.bashrc
fi

# Test syntax
bash -n ~/.bashrc
```

## Summary

**Attack Timeline:**
1. **Nov 21-22**: Attackers brute-forced SSH and gained access
2. **Dec 5-10**: Installed nezha/gaganode malware
3. **Dec 7-9**: Nezha processes started running
4. **Dec 12**: We discovered javs malware and removed it
5. **Ongoing**: Brute force attacks continue daily

**What to do:**
1. Remove nezha/gaganode immediately
2. Block attacker IPs
3. Disable SSH password authentication (use keys only)
4. Install fail2ban
5. Change all passwords
6. Monitor for return

