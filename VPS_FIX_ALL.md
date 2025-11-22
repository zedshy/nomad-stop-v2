# Fix All VPS Issues

## Issue 1: Git Conflict with ecosystem.config.js

The VPS has a local `ecosystem.config.js` that conflicts with the repo. Fix it:

```bash
cd /var/www/nomad-stop
# Backup the existing file
mv ecosystem.config.js ecosystem.config.js.backup
# Pull latest
git pull origin main
```

## Issue 2: ESLint Still Running

The `ignoreDuringBuilds` option might not work with Turbopack. Use the build script without Turbopack for production:

Update `package.json` build script, or run:

```bash
next build
```

Instead of:

```bash
npm run build  # This uses --turbopack
```

## Issue 3: ecosystem.config.js Syntax Error

The file on VPS has a syntax error. After pulling latest, verify it's correct.

## Complete Fix Steps

Run these commands on your VPS:

```bash
cd /var/www/nomad-stop

# Fix Git conflict
mv ecosystem.config.js ecosystem.config.js.backup 2>/dev/null || true
git pull origin main

# Verify ecosystem.config.js is correct
cat ecosystem.config.js

# Build without Turbopack (to avoid ESLint issues)
next build

# Start PM2
pm2 delete nomad-stop 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 status
```

## Alternative: Build Without Turbopack

If ESLint keeps blocking, build without Turbopack:

```bash
cd /var/www/nomad-stop
next build  # Without --turbopack flag
```

This might avoid the Turbopack ESLint integration issue.

