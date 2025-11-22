# Fix 502 Bad Gateway Error

## Problem
The site is showing "502 Bad Gateway" which means:
- ✅ Nginx is working
- ❌ The Next.js app on port 3000 is not running or crashed

## Quick Diagnosis

Run these commands on your VPS to check what's wrong:

```bash
cd /var/www/nomad-stop

# Check PM2 status
pm2 status

# Check logs for errors
pm2 logs nomad-stop --lines 100

# Check if port 3000 is listening
sudo netstat -tuln | grep 3000

# Check if the app crashed
pm2 list
```

## Common Fixes

### Fix 1: PM2 Process Not Running

If PM2 shows the app as "errored" or not running:

```bash
cd /var/www/nomad-stop

# Check what's wrong
pm2 logs nomad-stop --lines 100

# Restart the app
pm2 restart nomad-stop

# Or start it fresh
pm2 delete nomad-stop
pm2 start ecosystem.config.js
pm2 save
```

### Fix 2: App Crashing on Startup

Check the logs for errors:

```bash
cd /var/www/nomad-stop
pm2 logs nomad-stop --lines 100
```

Common issues:
- Missing environment variables in .env
- Database connection error
- Port 3000 already in use
- Build artifacts missing

### Fix 3: Rebuild and Restart

If the build is missing or corrupted:

```bash
cd /var/www/nomad-stop

# Stop PM2
pm2 delete nomad-stop

# Rebuild
npm run build:prod

# Start again
pm2 start ecosystem.config.js
pm2 save
pm2 status
```

### Fix 4: Check Environment Variables

Make sure .env file exists and has all required values:

```bash
cd /var/www/nomad-stop
cat .env | grep -v PASSWORD  # View without passwords
```

Make sure these are set:
- DATABASE_URL
- WORLDPAY_USERNAME, WORLDPAY_PASSWORD
- EMAIL_USER, EMAIL_PASS
- ADMIN_PASSWORD

### Fix 5: Check Port 3000

If port 3000 is already in use:

```bash
# Check what's using port 3000
sudo lsof -i :3000

# Kill it if needed
sudo kill -9 <PID>

# Restart PM2
pm2 restart nomad-stop
```

### Fix 6: Rebuild from Scratch

If nothing works:

```bash
cd /var/www/nomad-stop

# Stop everything
pm2 delete nomad-stop

# Remove old build
rm -rf .next

# Rebuild
npm run build:prod

# Start PM2
pm2 start ecosystem.config.js
pm2 save

# Check status
pm2 status
pm2 logs nomad-stop --lines 50
```

## Verify It's Working

After fixing, check:

```bash
# PM2 should show app as "online"
pm2 status

# Port 3000 should be listening
sudo netstat -tuln | grep 3000

# Test locally on VPS
curl http://localhost:3000

# Check Nginx
sudo nginx -t
sudo systemctl status nginx
```

## Still Not Working?

Share the output of these commands:

```bash
pm2 status
pm2 logs nomad-stop --lines 50
sudo netstat -tuln | grep 3000
cat /var/www/nomad-stop/.env | head -5
```

