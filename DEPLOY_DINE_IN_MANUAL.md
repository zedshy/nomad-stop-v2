# Manual Deployment Steps for Dine In Feature

Run these commands **on your VPS** (via SSH):

```bash
cd /var/www/nomad-stop

# 1. Pull latest code
git pull origin main

# 2. Run database migration
npx prisma migrate deploy

# If migration fails, run this SQL directly:
# psql $DATABASE_URL -c "ALTER TYPE \"FulfilmentType\" ADD VALUE IF NOT EXISTS 'dine_in';"

# 3. Generate Prisma client
npx prisma generate

# 4. Stop the application
pm2 stop nomad-stop

# 5. Rebuild the application
npm run build:prod

# 6. Restart the application
pm2 restart nomad-stop

# 7. Check status
pm2 status
```

## Quick One-Liner (if you're already on the VPS):

```bash
cd /var/www/nomad-stop && git pull origin main && npx prisma migrate deploy && npx prisma generate && pm2 stop nomad-stop && npm run build:prod && pm2 restart nomad-stop && pm2 status
```

## What This Does:

1. **Pulls latest code** - Gets the new Dine In/Take Away buttons and icons
2. **Runs migration** - Adds `dine_in` to the FulfilmentType enum in the database
3. **Generates Prisma client** - Updates the database client with the new enum value
4. **Rebuilds app** - Compiles the Next.js application with all changes
5. **Restarts PM2** - Applies the new build to the live site

## After Deployment:

Visit your website and you should see:
- ✅ Two buttons on the homepage: "Dine In" (with fork/knife icon) and "Take Away" (with shopping bag icon)
- ✅ Clicking either button takes you to the menu
- ✅ In checkout, you'll see three options: Dine In, Take Away, and Delivery (all with icons)
