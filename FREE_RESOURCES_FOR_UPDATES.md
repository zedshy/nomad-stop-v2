# Free Resources for Price Updates

The security tools (fail2ban, UFW) we added might be consuming resources. Here's how to temporarily free up memory for price updates.

## Quick Commands to Free Resources

**On the VPS, run these commands:**

### Option 1: Temporarily Stop fail2ban (Recommended)

```bash
# Stop fail2ban temporarily
sudo systemctl stop fail2ban

# Check memory
free -h

# Run your price updates (SQL or admin panel)

# Restart fail2ban after updates
sudo systemctl start fail2ban
```

### Option 2: Stop PM2 Application Temporarily

```bash
# Stop the app to free memory
pm2 stop all

# Check memory
free -h

# Run price updates

# Restart app
pm2 start all
```

### Option 3: Clear System Caches

```bash
# Clear caches
sudo sync
sudo sysctl vm.drop_caches=3

# Check memory
free -h
```

### Option 4: Check What's Using Memory

```bash
# See top memory consumers
ps aux --sort=-%mem | head -10

# See CPU usage
top -bn1 | head -20
```

## Recommended Sequence

1. **Stop fail2ban** (it's the most resource-intensive security tool):
   ```bash
   sudo systemctl stop fail2ban
   ```

2. **Clear caches**:
   ```bash
   sudo sync && sudo sysctl vm.drop_caches=3
   ```

3. **Check memory**:
   ```bash
   free -h
   ```

4. **Run price updates** (via SQL or admin panel)

5. **Restart fail2ban**:
   ```bash
   sudo systemctl start fail2ban
   ```

## Note About UFW

UFW (firewall) is very lightweight and shouldn't cause memory issues. You typically don't need to stop it.

## After Updates

Make sure to restart fail2ban:
```bash
sudo systemctl start fail2ban
sudo systemctl status fail2ban
```

This ensures your server remains protected while allowing you to complete the price updates.

