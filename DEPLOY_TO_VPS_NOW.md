# 🚀 Deploy Latest Changes to VPS

## ✅ Step 1: Open Terminal and SSH to VPS

Open a **new Terminal window** and run:

```bash
ssh nomadadmin@92.205.231.55
```

When prompted for password, enter: `Nomad133@`

---

## ✅ Step 2: Update the Application

Once connected to VPS, copy and paste these commands:

```bash
# Navigate to project directory
cd /var/www/nomad-stop

# Pull latest changes from GitHub
git pull origin main

# Install any new dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run database migrations (if any)
npx prisma migrate deploy

# Build the application with latest changes
npm run build:prod

# Restart the application
pm2 restart nomad-stop

# Check status
pm2 status nomad-stop
```

---

## ✅ Step 3: Verify Deployment

Check that everything is working:

```bash
# View recent logs
pm2 logs nomad-stop --lines 30

# Check if app is running
pm2 status
```

---

## 🌐 Test Your Site

Open in browser:
- **Website**: http://92.205.231.55
- **Admin Panel**: http://92.205.231.55/admin
- **Menu (Mobile View)**: Use browser dev tools or your phone

---

## 📱 What's New in This Deployment:

### Mobile Improvements:
- ✅ 2-column grid layout for menu items
- ✅ 2-column grid for category tabs (Afghan Specials, Deals, etc.)
- ✅ Much better spacing and padding
- ✅ Optimized card design for mobile
- ✅ Improved readability with responsive text sizes

### Production Ready:
- ✅ Worldpay set to **production mode**
- ✅ Database configured
- ✅ Payment processing ready for live transactions

---

## 🐛 If Something Goes Wrong:

```bash
# Check detailed logs
pm2 logs nomad-stop --lines 100

# Restart if needed
pm2 restart nomad-stop

# Check if port 3000 is in use
sudo netstat -tuln | grep 3000

# If app won't start, delete and recreate PM2 process
pm2 delete nomad-stop
pm2 start npm --name "nomad-stop" -- start
pm2 save
```

---

## 📞 Quick Reference:

**VPS Details:**
- IP: 92.205.231.55
- User: nomadadmin
- App Location: /var/www/nomad-stop

**Common Commands:**
```bash
pm2 status           # Check app status
pm2 logs nomad-stop  # View logs
pm2 restart nomad-stop  # Restart app
git pull origin main # Pull latest code
```

---

## ✅ All Done!

After running the commands above, your VPS will have:
- ✅ Latest mobile-optimized layout
- ✅ Production-ready payment processing
- ✅ All improvements from GitHub

Test it out and let me know how it looks! 🎉



