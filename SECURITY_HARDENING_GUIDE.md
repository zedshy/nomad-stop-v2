# Security Hardening Guide

## Immediate Actions

### 1. Change All Passwords

```bash
# Change user password
passwd

# Change root password (if you have root access)
sudo passwd root

# Change database passwords (update in .env)
# Change application admin passwords
```

### 2. Review and Clean SSH Keys

```bash
# View your authorized keys
cat ~/.ssh/authorized_keys

# Remove any unknown keys
nano ~/.ssh/authorized_keys
# Delete lines with unknown keys, save and exit

# View root keys
sudo cat /root/.ssh/authorized_keys
# Remove unknown keys if found
```

### 3. Clean Up Malicious Files

```bash
# Remove malicious files from /tmp
sudo find /tmp -type f \( -name "*react*" -o -name "*miner*" -o -name "*xmrig*" -o -name "*solrk*" \) -delete

# Check for and remove suspicious scripts
sudo find /var/www -name "*.sh" -type f -exec ls -la {} \;
```

### 4. Clean Up Cron Jobs

```bash
# View your cron jobs
crontab -l

# Edit cron jobs (remove suspicious entries)
crontab -e

# View root cron jobs
sudo crontab -l
sudo crontab -e

# Check system cron directories
ls -la /etc/cron.d/
ls -la /etc/cron.hourly/
ls -la /etc/cron.daily/
```

### 5. Install and Configure Fail2Ban

```bash
# Install fail2ban
sudo apt update
sudo apt install -y fail2ban

# Start and enable
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Check status
sudo systemctl status fail2ban
```

### 6. Update System Packages

```bash
# Update package list
sudo apt update

# Upgrade all packages
sudo apt upgrade -y

# Check for security updates
sudo apt list --upgradable
```

### 7. Review Firewall Rules

```bash
# Check current firewall status
sudo ufw status verbose

# If not enabled, configure it
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Check status
sudo ufw status
```

### 8. Review Application Security

The logs show command injection attempts. Review your application code for:

- **Command execution vulnerabilities**: Any code that executes system commands
- **Input validation**: Ensure all user inputs are validated
- **Environment variable exposure**: Check if .env is exposed
- **API endpoints**: Review API routes for vulnerabilities

### 9. Secure Environment Variables

```bash
# Ensure .env file has correct permissions
chmod 600 /var/www/nomad-stop/.env

# Review .env file for exposed secrets
cat /var/www/nomad-stop/.env | grep -v "PASSWORD\|SECRET\|PASS"

# Ensure .env is not in git
cd /var/www/nomad-stop
git check-ignore .env || echo ".env" >> .gitignore
```

### 10. Monitor Logs

```bash
# Set up log monitoring
# Check application logs regularly
tail -f /var/www/nomad-stop/logs/err.log

# Monitor auth logs
sudo tail -f /var/log/auth.log

# Monitor system logs
sudo journalctl -f
```

## Long-term Security Measures

1. **Regular Security Audits**: Run the security audit script monthly
2. **Automated Updates**: Set up automatic security updates
3. **Backup Strategy**: Regular backups of important data
4. **Code Review**: Review application code for security vulnerabilities
5. **WAF**: Consider using a Web Application Firewall
6. **Intrusion Detection**: Set up monitoring and alerts
7. **Access Control**: Limit SSH access, use key-based authentication only
8. **Application Updates**: Keep Next.js and all dependencies updated

## How the Server Was Likely Compromised

Based on the logs, the attack pattern suggests:

1. **Command Injection**: Malicious requests to your application trying to execute commands
2. **Environment Variable Theft**: Attempts to read .env files
3. **Persistence**: Attempts to install cron jobs for persistence
4. **Cryptocurrency Mining**: Attempts to download and run miners

## Prevention

1. **Input Validation**: Validate and sanitize all user inputs
2. **Command Execution**: Never execute user-provided commands
3. **Environment Variables**: Never expose .env in logs or responses
4. **Error Handling**: Don't expose detailed errors to users
5. **Rate Limiting**: Implement rate limiting on API endpoints
6. **WAF**: Use a Web Application Firewall to filter malicious requests


