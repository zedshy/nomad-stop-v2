# Domain Setup for nomadstop.co.uk

Your DNS is already configured! Now let's complete the VPS setup.

## ✅ What's Already Done

- ✅ A record for `@` pointing to `92.205.231.55` - **Perfect!**
- ✅ NS records (nameservers) - Required by GoDaddy

## 📋 What to Do Next

### Step 1: Add WWW Subdomain (Recommended)

In GoDaddy DNS, add another A record:

1. Click "Add" to add a new record
2. Set the following:
   - **Type:** `A`
   - **Name:** `www`
   - **Data/Value:** `92.205.231.55`
   - **TTL:** `600 seconds` (or Default)
3. Click "Save"

This will allow `www.nomadstop.co.uk` to work too.

---

### Step 2: Update Nginx Configuration on VPS

SSH into your VPS and update nginx:

```bash
ssh nomadadmin@92.205.231.55
cd /var/www/nomad-stop
```

**Edit nginx configuration:**
```bash
sudo nano /etc/nginx/sites-available/nomad-stop
```

**Replace the entire content with:**
```nginx
server {
    listen 80;
    server_name nomadstop.co.uk www.nomadstop.co.uk 92.205.231.55;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

**Test nginx configuration:**
```bash
sudo nginx -t
```

**If test is successful, restart nginx:**
```bash
sudo systemctl restart nginx
```

---

### Step 3: Update Environment Variables

Update your `.env` file:

```bash
cd /var/www/nomad-stop
nano .env
```

**Add or update this line:**
```bash
NEXT_PUBLIC_SITE_URL="http://nomadstop.co.uk"
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

**Restart PM2 with new environment:**
```bash
pm2 restart nomad-stop --update-env
```

---

### Step 4: Test Your Domain

**Check DNS propagation:**
```bash
nslookup nomadstop.co.uk
```

Should return: `92.205.231.55`

**Test in browser:**
- Visit: `http://nomadstop.co.uk`
- Visit: `http://nomadstop.co.uk/admin`

---

### Step 5: Set Up SSL/HTTPS (Optional but Recommended)

To enable HTTPS with free SSL certificate:

**Install Certbot:**
```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

**Get SSL Certificate:**
```bash
sudo certbot --nginx -d nomadstop.co.uk -d www.nomadstop.co.uk
```

**Follow the prompts:**
- Enter your email address
- Agree to terms
- Choose to redirect HTTP to HTTPS (recommended: Yes)

**After SSL is set up, update .env again:**
```bash
nano .env
```

Change:
```bash
NEXT_PUBLIC_SITE_URL="https://nomadstop.co.uk"
```

**Restart PM2:**
```bash
pm2 restart nomad-stop --update-env
```

---

## 🚀 Quick Commands Reference

```bash
# Check nginx status
sudo systemctl status nginx

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# Check DNS
nslookup nomadstop.co.uk
dig nomadstop.co.uk

# Check PM2 status
pm2 status

# Check if app is running
curl http://localhost:3000
```

---

## ✅ Checklist

- [x] DNS A record configured (already done!)
- [ ] Add www A record (optional but recommended)
- [ ] Update nginx configuration on VPS
- [ ] Test nginx configuration
- [ ] Restart nginx
- [ ] Update .env file with domain URL
- [ ] Restart PM2
- [ ] Test domain access
- [ ] Set up SSL/HTTPS (optional)

---

## 🎯 Your Domain URLs

Once everything is set up, your site will be accessible at:

- **Main site:** `http://nomadstop.co.uk` (or `https://` with SSL)
- **Admin panel:** `http://nomadstop.co.uk/admin` (or `https://` with SSL)
- **WWW:** `http://www.nomadstop.co.uk` (if you add the www A record)

---

## ⚠️ Note About Existing CNAME Records

The existing CNAME records (email, cpanel, etc.) are fine to keep - they're used for email and other services. They won't interfere with your website.




