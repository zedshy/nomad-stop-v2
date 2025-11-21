# Deploy to Vercel with Neon Database

This is the **easiest deployment option** - push to GitHub and Vercel handles everything automatically.

## Architecture

```
GitHub (Code)
    ↓
Vercel (Hosts Next.js App)
    ↓
Neon PostgreSQL (Database)
```

## Prerequisites

- GitHub account
- Vercel account (free tier available)
- Neon database (already set up)

## Step 1: Push Code to GitHub

```bash
# On your local machine
cd /Users/zeshaanqureshi/Desktop/Nomad-Stop-NextJS

# Make sure you're on the main branch
git checkout main

# Add all files
git add .

# Commit changes
git commit -m "Ready for deployment"

# Push to GitHub
git push origin main
```

## Step 2: Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click **"Add New Project"**
4. Import your GitHub repository (`nomad-stop-js`)
5. Vercel will detect it's a Next.js project automatically

## Step 3: Configure Environment Variables in Vercel

In the Vercel project settings, add these environment variables:

### Database (Neon)
```
DATABASE_URL=postgresql://neondb_owner:npg_4BLcy9jEvdhY@ep-wandering-base-abtz4yht-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
DISABLE_DB=false
```

### Next.js
```
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://your-app-name.vercel.app
```

### Worldpay (Production)
```
WORLDPAY_USERNAME=your_production_username
WORLDPAY_PASSWORD=your_production_password
WORLDPAY_CHECKOUT_ID=your_production_checkout_id
WORLDPAY_ENTITY_ID=your_production_entity_id
WORLDPAY_ENVIRONMENT=production
WORLDPAY_WEBHOOK_SECRET=your_production_webhook_secret
```

### Email (Resend)
```
RESEND_API_KEY=your_resend_api_key
```

### Admin
```
ADMIN_PASSWORD=your_secure_admin_password
```

**How to add environment variables:**
1. Go to your Vercel project
2. Click **Settings** → **Environment Variables**
3. Add each variable
4. Make sure to select **Production**, **Preview**, and **Development** environments

## Step 4: Deploy

1. Click **"Deploy"** in Vercel
2. Vercel will:
   - Install dependencies
   - Run `npm run build`
   - Deploy your app
   - Give you a URL like `https://your-app.vercel.app`

## Step 5: Run Database Migrations

After first deployment:

```bash
# Option A: Using Vercel CLI
npm i -g vercel
vercel login
vercel link
npx prisma migrate deploy

# Option B: Using Neon Dashboard
# Go to Neon dashboard → SQL Editor
# Run migrations manually (not recommended)
```

**Or use Vercel's Post-Deploy Hook:**

Create `vercel.json` in project root:

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install && npx prisma generate",
  "framework": "nextjs",
  "regions": ["lhr1"]
}
```

## Step 6: Seed Database (Optional)

If you need to seed the database:

```bash
# Using Vercel CLI
vercel env pull .env.local
npm run seed
```

Or use Neon's SQL Editor to run the seed script manually.

## Automatic Deployments

Once set up:
- **Every push to `main` branch** → Auto-deploys to production
- **Every pull request** → Creates preview deployment
- **No manual deployment needed!**

## Custom Domain (Optional)

1. Go to Vercel project → **Settings** → **Domains**
2. Add your domain (e.g., `nomadstop.com`)
3. Follow DNS instructions
4. Vercel handles SSL automatically

## Benefits of Vercel + Neon

✅ **Zero Server Management**
- No VPS setup needed
- No server maintenance
- Auto-scaling

✅ **Automatic Deployments**
- Push to GitHub = Auto-deploy
- Preview deployments for PRs
- Rollback with one click

✅ **Global CDN**
- Fast loading worldwide
- Edge functions support
- Optimized Next.js builds

✅ **Free Tier**
- Generous free tier
- Perfect for most sites
- Easy to upgrade if needed

✅ **Integrated with Neon**
- Same database connection
- Works seamlessly
- No configuration needed

## Monitoring

- **Vercel Dashboard**: View deployments, logs, analytics
- **Neon Dashboard**: Monitor database usage, connections
- **Built-in Analytics**: Page views, performance metrics

## Troubleshooting

### Build Fails

1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Check `package.json` scripts are correct

### Database Connection Issues

1. Verify `DATABASE_URL` in Vercel environment variables
2. Check Neon dashboard for connection limits
3. Ensure `DISABLE_DB=false` is set

### Environment Variables Not Working

1. Make sure variables are set for **Production** environment
2. Redeploy after adding new variables
3. Check variable names match exactly (case-sensitive)

## Cost

- **Vercel**: Free tier (generous) or $20/month for Pro
- **Neon**: Free tier (generous) or pay-as-you-go
- **Total**: $0/month for most small-medium sites

## Next Steps

1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy!
5. Set up custom domain (optional)

That's it! Your site will be live in minutes. 🚀

