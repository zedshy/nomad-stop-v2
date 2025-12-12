# Server-Side 502 Bad Gateway Diagnosis Guide

## What is a 502 Error?

A **502 Bad Gateway** error means:
- ✅ **Nginx is working** (it's serving the error page)
- ❌ **The Next.js application on port 3000 is NOT running or crashed**

## Quick Diagnosis (Run on VPS)

### Option 1: Use the Diagnostic Script

```bash
# SSH into your VPS
ssh your-user@your-vps-ip

# Navigate to app directory
cd /var/www/nomad-stop

# Run diagnostic script
bash diagnose-502-error.sh
```

This will check:
- PM2 process status
- Port 3000 status
- Application logs
- Nginx status
- Build artifacts
- Environment variables

### Option 2: Manual Diagnosis

```bash
# 1. Check PM2 status
cd /var/www/nomad-stop
pm2 status

# 2. Check if port 3000 is listening
sudo netstat -tuln | grep 3000

# 3. Check PM2 logs for errors
pm2 logs nomad-stop --lines 100

# 4. Test if app responds locally
curl http://localhost:3000

# 5. Check nginx status
sudo systemctl status nginx

# 6. Check nginx error logs
sudo tail -f /var/log/nginx/error.log
```

## Quick Fix (Run on VPS)

### Option 1: Use the Auto-Fix Script

```bash
# SSH into your VPS
ssh your-user@your-vps-ip

# Navigate to app directory
cd /var/www/nomad-stop

# Run fix script
bash fix-502-error.sh
```

### Option 2: Manual Fix Steps

#### Step 1: Check PM2 Status
```bash
cd /var/www/nomad-stop
pm2 status
```

#### Step 2: Restart PM2 Process
```bash
# If process exists but is errored/stopped
pm2 restart nomad-stop

# OR if process doesn't exist
pm2 delete nomad-stop
pm2 start ecosystem.config.js
pm2 save
```

#### Step 3: Check if Port 3000 is Listening
```bash
sudo netstat -tuln | grep 3000
```

If port 3000 is NOT listening:
```bash
# Check logs for errors
pm2 logs nomad-stop --lines 100

# Rebuild if needed
npm run build:prod

# Restart PM2
pm2 restart nomad-stop
```

#### Step 4: Verify Application Responds
```bash
curl http://localhost:3000
```

#### Step 5: Restart Nginx
```bash
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

## Common Causes & Solutions

### 1. PM2 Process Crashed
**Symptoms:** `pm2 status` shows process as "errored" or "stopped"

**Fix:**
```bash
cd /var/www/nomad-stop
pm2 logs nomad-stop --lines 100  # Check what went wrong
pm2 restart nomad-stop
```

### 2. Application Not Built
**Symptoms:** No `.next` directory or build errors

**Fix:**
```bash
cd /var/www/nomad-stop
npm run build:prod
pm2 restart nomad-stop
```

### 3. Port 3000 Already in Use
**Symptoms:** Port conflict error in logs

**Fix:**
```bash
# Find what's using port 3000
sudo lsof -i :3000

# Kill the process if needed
sudo kill -9 <PID>

# Restart PM2
pm2 restart nomad-stop
```

### 4. Missing Environment Variables
**Symptoms:** Database connection errors or missing config

**Fix:**
```bash
cd /var/www/nomad-stop
# Check .env file exists and has required variables
cat .env | grep -v PASSWORD

# If missing, copy from template
cp env-template.txt .env
# Edit .env with proper values
nano .env

# Restart PM2
pm2 restart nomad-stop
```

### 5. Database Connection Issues
**Symptoms:** Database connection errors in logs

**Fix:**
```bash
# Check DATABASE_URL in .env
cd /var/www/nomad-stop
grep DATABASE_URL .env

# Test database connection
# (depends on your database setup)

# Restart PM2 after fixing
pm2 restart nomad-stop
```

### 6. Out of Memory
**Symptoms:** Process killed, memory errors

**Fix:**
```bash
# Check memory
free -h

# Check PM2 memory limits
pm2 describe nomad-stop

# Restart PM2 (clears memory)
pm2 restart nomad-stop
```

## Verification Checklist

After fixing, verify everything is working:

```bash
# ✅ PM2 shows app as "online"
pm2 status

# ✅ Port 3000 is listening
sudo netstat -tuln | grep 3000

# ✅ Application responds locally
curl http://localhost:3000

# ✅ Nginx is running
sudo systemctl status nginx

# ✅ Nginx config is valid
sudo nginx -t

# ✅ Site is accessible
curl http://nomadstop.co.uk
```

## Getting Help

If the issue persists, collect this information:

```bash
# PM2 status and logs
pm2 status
pm2 logs nomad-stop --lines 100

# Port status
sudo netstat -tuln | grep 3000

# Nginx status
sudo systemctl status nginx
sudo tail -20 /var/log/nginx/error.log

# Application directory
ls -la /var/www/nomad-stop
ls -la /var/www/nomad-stop/.next 2>/dev/null || echo "No .next directory"

# Environment (without passwords)
cd /var/www/nomad-stop
cat .env | grep -v PASSWORD | grep -v SECRET
```

## Files Created

1. **`diagnose-502-error.sh`** - Comprehensive diagnostic script
2. **`fix-502-error.sh`** - Automated fix script
3. **`SERVER_502_DIAGNOSIS.md`** - This guide

Upload these files to your VPS and run them to diagnose and fix the issue.


