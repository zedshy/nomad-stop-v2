# Fix Build Error on VPS

## The Problem
The build is failing because `@tailwindcss/postcss` is missing. This is a devDependency needed for building.

## The Fix

SSH into your VPS (if not already connected):
```bash
ssh nomadadmin@92.205.231.55
```

Then run these commands on the VPS:

```bash
cd /var/www/nomad-stop

# Install ALL dependencies (including devDependencies needed for build)
npm install

# Now try building again
npm run build
```

## What Changed

I've updated the deployment script to use `npm install` instead of `npm install --production`. This ensures all devDependencies (like Tailwind CSS build tools) are installed for the build process.

The updated script is now in GitHub, so future deployments will work correctly.

## After Fixing

Once the build succeeds, restart PM2:

```bash
pm2 restart nomad-stop
pm2 logs nomad-stop
```

Then test your site at: http://92.205.231.55

