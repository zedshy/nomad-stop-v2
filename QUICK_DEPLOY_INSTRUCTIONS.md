# 🚀 Quick Deployment Instructions

## Status: Ready to Deploy!

I've created a complete deployment script. Here's how to run it:

---

## Step 1: SSH into Your VPS

Open a **new terminal window** on your Mac and run:

```bash
ssh nomadadmin@92.205.231.55
```

**Password:** `Nomad133@`

---

## Step 2: Download and Run the Deployment Script

Once you're connected to the VPS, run this single command:

```bash
curl -sSL https://raw.githubusercontent.com/zedshy/nomad-stop-v2/main/DEPLOY_NOW.sh | bash
```

**OR** if you prefer to download it first:

```bash
curl -sSL https://raw.githubusercontent.com/zedshy/nomad-stop-v2/main/DEPLOY_NOW.sh -o deploy.sh
chmod +x deploy.sh
./deploy.sh
```

---

## What the Script Does:

✅ Updates system packages  
✅ Installs Node.js 20  
✅ Installs PM2, Nginx, Git  
✅ Creates project directory  
✅ Clones your repository from GitHub  
✅ Installs all dependencies  
✅ Generates Prisma client  
✅ Creates .env file template  
✅ **Pauses for you to edit .env with your actual values**  
✅ Runs database migrations  
✅ Builds the Next.js application  
✅ Sets up PM2 to run the app  
✅ Configures Nginx as reverse proxy  
✅ Sets up firewall  

---

## Step 3: Edit Environment Variables

The script will **pause** and ask you to edit the `.env` file. You'll need to enter your actual values for:

- **DATABASE_URL** - Your Neon PostgreSQL connection string
- **WORLDPAY_USERNAME** - Your Worldpay API username
- **WORLDPAY_PASSWORD** - Your Worldpay API password  
- **WORLDPAY_CHECKOUT_ID** - Your Worldpay checkout ID
- **WORLDPAY_ENTITY_ID** - Your Worldpay entity ID
- **WORLDPAY_WEBHOOK_SECRET** - Your Worldpay webhook secret
- **EMAIL_USER** - Your email address (for sending emails)
- **EMAIL_PASS** - Your email password/app password
- **ADMIN_PASSWORD** - Admin panel password

After editing, save with `Ctrl+X`, then `Y`, then `Enter`.

---

## Step 4: Verify Deployment

After the script completes:

1. **Check PM2 status:**
   ```bash
   pm2 status
   ```
   Should show `nomad-stop` as `online`

2. **Check logs:**
   ```bash
   pm2 logs nomad-stop --lines 50
   ```
   Look for any errors

3. **Visit your site:**
   Open in browser: **http://92.205.231.55**

---

## If Something Goes Wrong:

### App not running?
```bash
pm2 logs nomad-stop --lines 100
# Check for errors
pm2 restart nomad-stop
```

### Site not loading?
```bash
# Check if app is listening on port 3000
sudo netstat -tuln | grep 3000

# Check Nginx
sudo nginx -t
sudo systemctl status nginx
sudo systemctl restart nginx
```

### Database connection errors?
- Double-check your `DATABASE_URL` in `.env`
- Make sure your Neon database allows connections from the VPS IP (92.205.231.55)
- Re-run migrations: `cd /var/www/nomad-stop && npx prisma migrate deploy`

---

## Need Help?

If you encounter any issues, share the error message and I'll help you fix it!

---

**Ready? SSH into your VPS and run the script!** 🚀

