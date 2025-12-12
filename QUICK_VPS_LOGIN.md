# Quick VPS Login Guide

## SSH Connection Details

**VPS IP:** `92.205.231.55`  
**Username:** `nomadadmin`  
**Password:** `Nomad133@`  
**App Directory:** `/var/www/nomad-stop`

## How to Connect

### Step 1: Open Terminal in Cursor

**Method 1: Keyboard Shortcut (Easiest)**
- Press: `Control + ` ` (Control + Backtick)
- The backtick (`) is above the Tab key

**Method 2: Menu**
- Click **View** → **Terminal**

**Method 3: Command Palette**
- Press: `Cmd + Shift + P` (Mac) or `Ctrl + Shift + P` (Windows)
- Type: `Terminal: Create New Terminal`

### Step 2: SSH to VPS

Once terminal is open, type:

```bash
ssh nomadadmin@92.205.231.55
```

When prompted for password, enter:
```
Nomad133@
```

### Step 3: Navigate to App Directory

After connecting, run:

```bash
cd /var/www/nomad-stop
```

## Quick Commands for 502 Error

Once connected and in the app directory:

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs nomad-stop --lines 100

# Check if port 3000 is listening
sudo netstat -tuln | grep 3000

# Restart the app
pm2 restart nomad-stop

# Or if that doesn't work:
pm2 delete nomad-stop
pm2 start ecosystem.config.js
pm2 save
```

## Using the Diagnostic Scripts

If you've uploaded the diagnostic scripts to the VPS:

```bash
# After SSH and cd to /var/www/nomad-stop

# Run diagnostic
bash diagnose-502-error.sh

# Or run auto-fix
bash fix-502-error.sh
```

## Quick Reference

**To exit SSH session:**
```bash
exit
```

**To copy files to VPS:**
```bash
# From your local machine (in a new terminal)
scp diagnose-502-error.sh nomadadmin@92.205.231.55:/var/www/nomad-stop/
scp fix-502-error.sh nomadadmin@92.205.231.55:/var/www/nomad-stop/
```

**To test if site is working:**
```bash
# On VPS, test locally
curl http://localhost:3000

# Check nginx
sudo systemctl status nginx
sudo nginx -t
```


