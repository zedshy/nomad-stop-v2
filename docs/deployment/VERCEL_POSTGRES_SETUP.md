# Vercel Postgres Setup Guide

Vercel offers a managed PostgreSQL database that integrates directly with your Vercel project. No need for external providers like Neon or Supabase!

## Step 1: Create Vercel Postgres Database

1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Select your project: `nomad-stop-v2`
3. Go to the **Storage** tab (in the top navigation)
4. Click **Create Database**
5. Select **Postgres**
6. Choose a plan:
   - **Hobby** (Free) - Good for development/testing
   - **Pro** - For production (starts at $20/month)
7. Select a region (choose closest to your users)
8. Click **Create**

## Step 2: Connect to Your Project

After creating the database:

1. Vercel will automatically add the `POSTGRES_URL` environment variable
2. You may also see `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING`
3. **Important:** For Prisma, you should use `POSTGRES_PRISMA_URL` or `POSTGRES_URL`

## Step 3: Update Environment Variables

Vercel automatically adds these variables, but you need to set `DATABASE_URL`:

1. Go to **Settings** → **Environment Variables**
2. You should see:
   - `POSTGRES_URL` (already added by Vercel)
   - `POSTGRES_PRISMA_URL` (already added by Vercel)
   - `POSTGRES_URL_NON_POOLING` (already added by Vercel)

3. **Add or update `DATABASE_URL`:**
   - Click **Add** or find existing `DATABASE_URL`
   - **Key:** `DATABASE_URL`
   - **Value:** Copy the value from `POSTGRES_PRISMA_URL` (or `POSTGRES_URL`)
   - **Environments:** Select "All Environments"
   - Click **Save**

## Step 4: Run Database Migrations

After setting up the database, you need to run Prisma migrations:

### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. Link your project:
   ```bash
   vercel link
   ```

3. Pull environment variables:
   ```bash
   vercel env pull .env.local
   ```

4. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

5. Seed the database (optional):
   ```bash
   npm run seed
   ```

### Option B: Using Vercel Dashboard

1. Go to your project → **Settings** → **Build & Development Settings**
2. Add a build command that runs migrations:
   ```
   npm install && npx prisma generate && npx prisma migrate deploy && npm run build
   ```

## Step 5: Redeploy

1. Go to **Deployments** tab
2. Click the three dots (⋯) on the latest deployment
3. Select **Redeploy**

## Benefits of Vercel Postgres

✅ **No external accounts needed** - Everything in one place  
✅ **Automatic backups** - Built-in backup system  
✅ **Easy scaling** - Upgrade plan as needed  
✅ **Integrated** - Works seamlessly with Vercel deployments  
✅ **Connection pooling** - Optimized for serverless functions  

## Pricing

- **Hobby (Free):** 256 MB storage, 60 hours compute/month
- **Pro:** $20/month - 8 GB storage, better performance
- **Enterprise:** Custom pricing

## Troubleshooting

### "Database not found" error
- Make sure `DATABASE_URL` is set to the same value as `POSTGRES_PRISMA_URL`
- Check that migrations have been run

### Connection errors
- Verify `DATABASE_URL` is correctly set
- Make sure you're using `POSTGRES_PRISMA_URL` (includes connection pooling)

### Migration errors
- Run `npx prisma migrate deploy` locally after pulling env vars
- Or add migration step to build command

## Next Steps

After setting up Vercel Postgres:
1. ✅ Database is ready
2. Run migrations to create tables
3. Seed initial data (optional)
4. Test your payment flow

Your database will be automatically available to all your Vercel deployments!

