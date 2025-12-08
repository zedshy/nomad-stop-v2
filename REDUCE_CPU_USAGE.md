# Reduce CPU Usage on VPS

Your server is at **99.99% CPU usage** - this is why everything is failing! Here's how to fix it.

## Immediate Actions

### Step 1: Identify What's Using CPU

**On the VPS, run:**

```bash
# See top CPU-consuming processes
ps aux --sort=-%cpu | head -15

# Check PM2 processes
pm2 list

# Check Node.js processes
ps aux | grep -E "node|next|npm" | grep -v grep

# Check system load
uptime
```

### Step 2: Common Fixes

#### Fix 1: Restart PM2 Application

If the Next.js app is consuming too much CPU:

```bash
pm2 restart nomad-stop
# or
pm2 restart all
```

#### Fix 2: Kill Stuck Node Processes

If there are multiple Node processes running:

```bash
# See all Node processes
ps aux | grep node | grep -v grep

# Kill specific process (replace PID with actual process ID)
kill -9 <PID>

# Or kill all Next.js processes
pkill -f 'next'
```

#### Fix 3: Check for Database Connection Issues

Too many database connections can cause high CPU:

```bash
cd /var/www/nomad-stop
source .env
psql "$DATABASE_URL" -c "SELECT count(*) as active_connections FROM pg_stat_activity WHERE state != 'idle';"
```

If you see many connections, restart the app:

```bash
pm2 restart nomad-stop
```

#### Fix 4: Stop Unnecessary Services Temporarily

```bash
# Stop fail2ban (if not critical right now)
sudo systemctl stop fail2ban

# Check CPU again
top -bn1 | head -20
```

#### Fix 5: Check for Suspicious Processes

```bash
# Look for miners or suspicious processes
ps aux | grep -E "xmrig|miner|solrk" | grep -v grep

# If found, kill them
sudo kill -9 <PID>
```

### Step 3: Monitor CPU After Changes

```bash
# Watch CPU in real-time
top

# Or check every 5 seconds
watch -n 5 'ps aux --sort=-%cpu | head -10'
```

## Long-term Solutions

### 1. Optimize PM2 Configuration

Check your `ecosystem.config.js`:

```bash
cd /var/www/nomad-stop
cat ecosystem.config.js
```

Make sure it's not spawning too many instances. Should be:
```javascript
instances: 1,  // Not more than 1 on a 1-core server!
```

### 2. Limit PM2 Memory

Add memory limit to prevent runaway processes:

```bash
pm2 restart nomad-stop --max-memory-restart 500M
```

### 3. Check Application Logs

Look for errors or infinite loops:

```bash
pm2 logs nomad-stop --lines 100
```

### 4. Database Query Optimization

If database queries are slow, they can cause high CPU. Check for:
- Missing indexes
- Slow queries
- Too many connections

### 5. Consider Upgrading Server

If CPU is consistently high, you might need:
- More CPU cores
- Better server plan

## Quick Diagnostic Commands

```bash
# Full system check
ps aux --sort=-%cpu | head -15
pm2 list
pm2 logs nomad-stop --lines 50
uptime
free -h
```

## After Reducing CPU

Once CPU is below 50%, try the price updates again:

1. **Via Admin Panel** (recommended): `http://92.205.231.55/admin`
2. **Via SQL** (if CPU is low enough)

## Expected Results

After fixes, CPU should be:
- **Idle**: 5-20%
- **Normal operation**: 20-50%
- **Under load**: 50-80%
- **Critical**: 90%+ (needs immediate attention)

Your current **99.99%** is critical and needs immediate action!

