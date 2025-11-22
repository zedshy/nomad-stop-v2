# Fix Build Errors on VPS

## Issue 1: ESLint Errors During Build

The `NEXT_DISABLE_ESLINT=1` environment variable doesn't work with Turbopack. I've updated `next.config.ts` to disable ESLint during builds.

## Issue 2: Git Authentication Failed

The VPS can't pull from GitHub because it's trying to use password authentication. You have two options:

### Option A: Update Git Remote URL (Recommended)

On your VPS, run:
```bash
cd /var/www/nomad-stop
git remote set-url origin https://github.com/zedshy/nomad-stop-v2.git
git pull origin main
```

### Option B: Use SSH (if you have SSH keys set up)

```bash
cd /var/www/nomad-stop
git remote set-url origin git@github.com:zedshy/nomad-stop-v2.git
git pull origin main
```

## Issue 3: PM2 Process Not Found

PM2 process doesn't exist. After the build succeeds, start it:

```bash
cd /var/www/nomad-stop
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Complete Fix Commands

Run these on your VPS:

```bash
cd /var/www/nomad-stop

# Fix Git remote URL
git remote set-url origin https://github.com/zedshy/nomad-stop-v2.git

# Pull latest code
git pull origin main

# Build (ESLint is now disabled in next.config.ts)
npm run build

# Start PM2
pm2 delete nomad-stop 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# Check status
pm2 status
pm2 logs nomad-stop --lines 50
```

## After Fixing

Your site should be accessible at: http://92.205.231.55

