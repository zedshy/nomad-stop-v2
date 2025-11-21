# Vercel Environment Variables Setup

This guide explains how to add all required environment variables to your Vercel deployment.

## How to Add Environment Variables in Vercel

1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Select your project: `nomad-stop-v2`
3. Go to **Settings** → **Environment Variables**
4. Add each variable below with its value
5. Make sure to select **Production**, **Preview**, and **Development** environments (or at least **Production**)

## Required Environment Variables

### Database Configuration

```bash
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```

**Important:** 
- Replace with your actual PostgreSQL connection string
- If using Neon, Supabase, or another managed PostgreSQL service, get the connection string from their dashboard
- Make sure to URL-encode any special characters in the password

**Optional:**
```bash
DISABLE_DB=false
```
- Set to `"true"` to disable database operations (for testing only)
- Default: `false`

### Worldpay Payment Gateway

```bash
WORLDPAY_USERNAME=your_worldpay_username
WORLDPAY_PASSWORD=your_worldpay_password
WORLDPAY_CHECKOUT_ID=your_checkout_id
WORLDPAY_ENTITY_ID=your_entity_id
WORLDPAY_ENVIRONMENT=sandbox
WORLDPAY_WEBHOOK_SECRET=your_webhook_secret
```

**Notes:**
- `WORLDPAY_ENVIRONMENT` should be `"sandbox"` for testing or `"production"` for live
- Get these values from your Worldpay dashboard

### Email Configuration

You have two options for email:

#### Option 1: SMTP (using nodemailer)

```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@nomadstop.com
```

**For Gmail:**
- Use an App Password, not your regular password
- Enable 2FA first, then generate an App Password

#### Option 2: Resend (recommended for production)

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
ADMIN_EMAIL=admin@nomadstop.com
```

**Note:** If using Resend, you may need to update `src/lib/mailer.ts` to use Resend instead of nodemailer.

### Admin Configuration

```bash
ADMIN_PASSWORD=your-secure-admin-password
```

**Note:** This is used as a fallback if no admin users exist in the database.

### Next.js Public Variables

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

**Note:** Replace with your actual Vercel deployment URL or custom domain.

## Complete Example

Here's a complete example of all variables you might need:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
DISABLE_DB=false

# Worldpay
WORLDPAY_USERNAME=your_username
WORLDPAY_PASSWORD=your_password
WORLDPAY_CHECKOUT_ID=your_checkout_id
WORLDPAY_ENTITY_ID=your_entity_id
WORLDPAY_ENVIRONMENT=sandbox
WORLDPAY_WEBHOOK_SECRET=your_secret

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@nomadstop.com

# Or Email (Resend)
# RESEND_API_KEY=re_xxxxxxxxxxxxx
# ADMIN_EMAIL=admin@nomadstop.com

# Admin
ADMIN_PASSWORD=your-secure-password

# Next.js
NEXT_PUBLIC_SITE_URL=https://nomad-stop-v2.vercel.app
```

## After Adding Variables

1. **Redeploy** your application:
   - Go to **Deployments** tab
   - Click the three dots (⋯) on the latest deployment
   - Select **Redeploy**

2. **Verify** the deployment:
   - Check the build logs to ensure no environment variable errors
   - Test the payment flow on your deployed site

## Troubleshooting

### "Environment variable not found: DATABASE_URL"
- Make sure `DATABASE_URL` is added in Vercel
- Check that it's enabled for the correct environment (Production/Preview/Development)
- Redeploy after adding the variable

### Payment errors
- Verify all Worldpay credentials are correct
- Check that `WORLDPAY_ENVIRONMENT` matches your credentials (sandbox vs production)

### Email not sending
- Verify SMTP credentials or Resend API key
- Check spam folder
- Verify `ADMIN_EMAIL` is set correctly

## Security Notes

⚠️ **Never commit environment variables to Git!**
- All sensitive values should only be in Vercel's environment variables
- The `.env` file is already in `.gitignore`
- Use Vercel's environment variables for all production secrets

