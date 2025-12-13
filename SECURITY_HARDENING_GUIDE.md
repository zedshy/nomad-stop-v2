# Complete Security Hardening Guide for Nomad Stop Server

## Overview
This guide provides step-by-step instructions to permanently remove malware and secure your server.

## Prerequisites
**⚠️ CRITICAL: Before running the hardening script, ensure you have SSH key access!**

If you only have password authentication, you will be locked out after the script runs.

### Check if you have SSH keys:
```bash
ls -la ~/.ssh/id_rsa.pub
```

If this file doesn't exist, generate SSH keys first:
```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

Then copy your public key to the server:
```bash
ssh-copy-id nomadadmin@92.205.231.55
```

## Running the Security Hardening Script

### Option 1: Run the Complete Script (Recommended)
```bash
chmod +x complete-security-hardening.sh
./complete-security-hardening.sh
```

### Option 2: Manual Steps (If you prefer step-by-step)

#### Phase 1: Remove Malware
```bash
ssh nomadadmin@92.205.231.55

# Kill all malware processes
sudo pkill -9 -f javs
sudo pkill -9 -f nezha
sudo pkill -9 -f gaganode
sudo pkill -9 -f "/tmp/fghgf"
sudo pkill -9 -f sshds
sudo pkill -9 -f komari

# Remove malware directories
sudo rm -rf /home/nomadadmin/.javs
sudo rm -rf /home/nomadadmin/.sshds
sudo rm -rf /opt/.komari
sudo rm -rf /tmp/fghgf /tmp/ijnegrrinje.json

# Clean .bashrc
sed -i '/javs\|nezha\|gaganode\|fghgf\|sshds\|komari/d' ~/.bashrc

# Clean crontab
crontab -l | grep -v "javs\|nezha\|gaganode" | crontab -
```

#### Phase 2: Secure SSH
```bash
# Backup SSH config
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Set these values:
PasswordAuthentication no
PermitRootLogin no
PubkeyAuthentication yes
MaxAuthTries 3

# Test config
sudo sshd -t

# Restart SSH
sudo systemctl restart sshd
```

#### Phase 3: Configure Firewall
```bash
# Install UFW
sudo apt-get update
sudo apt-get install -y ufw

# Allow SSH first!
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Block attacker IPs
sudo ufw deny from 92.40.170.154
sudo ufw deny from 92.40.170.155
# ... (add other IPs)

# Enable firewall
sudo ufw enable
```

#### Phase 4: Install fail2ban
```bash
sudo apt-get install -y fail2ban

# Configure fail2ban
sudo nano /etc/fail2ban/jail.local
# (See script for configuration)

sudo systemctl enable fail2ban
sudo systemctl restart fail2ban
```

## What the Script Does

### 1. Malware Removal
- Kills all known malware processes
- Removes malware directories and files
- Cleans `.bashrc` and crontab
- Removes systemd services

### 2. SSH Security
- Disables password authentication
- Disables root login
- Enables public key authentication only
- Limits authentication attempts

### 3. Firewall Configuration
- Configures UFW (Uncomplicated Firewall)
- Allows only necessary ports (22, 80, 443)
- Blocks known attacker IPs

### 4. Security Tools
- Installs and configures fail2ban
- Sets up automatic security updates
- Creates malware monitoring script

### 5. System Hardening
- Disables unnecessary services
- Sets restrictive file permissions
- Configures automatic updates

### 6. Monitoring
- Creates daily malware check script
- Logs to `/var/log/malware-check.log`

## Post-Hardening Checklist

- [ ] Test SSH access with your key
- [ ] Verify firewall is active: `sudo ufw status`
- [ ] Check fail2ban status: `sudo fail2ban-client status`
- [ ] Monitor malware log: `tail -f /var/log/malware-check.log`
- [ ] Set up regular backups
- [ ] Consider upgrading server plan (more CPU cores)

## Daily Monitoring

Check these daily:
```bash
# Check for malware
sudo /usr/local/bin/check-malware.sh
cat /var/log/malware-check.log

# Check CPU usage
top

# Check fail2ban
sudo fail2ban-client status sshd

# Check firewall
sudo ufw status verbose
```

## If You Get Locked Out

If you lose SSH access:
1. Contact your hosting provider immediately
2. Use their web console/VNC access
3. Restore SSH config: `sudo cp /etc/ssh/sshd_config.backup.* /etc/ssh/sshd_config`
4. Restart SSH: `sudo systemctl restart sshd`

## Additional Security Recommendations

1. **Upgrade Server Plan**: Your 1 CPU core is insufficient. Consider upgrading to at least 2 cores.

2. **Regular Backups**: Set up automated backups of:
   - Database
   - Application files
   - Configuration files

3. **Monitor Resource Usage**: Set up alerts for:
   - CPU > 80%
   - Memory > 80%
   - Disk > 80%

4. **Keep Software Updated**:
   ```bash
   sudo apt-get update
   sudo apt-get upgrade
   ```

5. **Use Strong SSH Keys**: 4096-bit RSA or Ed25519 keys

6. **Regular Security Audits**: Run security scans monthly

## Troubleshooting

### SSH Connection Refused
- Check if SSH service is running: `sudo systemctl status sshd`
- Check firewall: `sudo ufw status`
- Verify SSH config: `sudo sshd -t`

### High CPU Usage Returns
- Check for new malware: `ps aux | grep -E "(javs|nezha|gaganode)"`
- Check malware log: `cat /var/log/malware-check.log`
- Review top processes: `top`

### Firewall Blocking Legitimate Traffic
- Check UFW rules: `sudo ufw status numbered`
- Remove rule: `sudo ufw delete [number]`
- Allow specific IP: `sudo ufw allow from [IP]`

## Support

If malware returns or you encounter issues:
1. Check the malware log first
2. Review system logs: `sudo journalctl -xe`
3. Contact your hosting provider
4. Consider professional security audit