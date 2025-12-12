# Set Up SSL/HTTPS for nomadstop.co.uk

Your site is showing "not secured" because it's using HTTP. Let's set up HTTPS with a free SSL certificate!

## Prerequisites

1. ✅ Domain DNS is configured (already done!)
2. ✅ Domain is pointing to your VPS (already done!)
3. ✅ Nginx is configured (should be done from previous steps)

## Step 1: Install Certbot (SSL Certificate Tool)

SSH into your VPS and install Certbot:

```bash
ssh nomadadmin@92.205.231.55
```

**Update package list:**
```bash
sudo apt update
```

**Install Certbot:**
```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

## Step 2: Get SSL Certificate

Certbot will automatically configure nginx for SSL. Run:

```bash
sudo certbot --nginx -d nomadstop.co.uk -d www.nomadstop.co.uk
```

**Follow the prompts:**

1. **Enter your email address** (for important renewal notices)
   - Example: `your-email@example.com`
   - Press Enter

2. **Agree to Terms of Service**
   - Type `A` to agree
   - Press Enter

3. **Share email with EFF?** (optional)
   - Type `Y` for yes or `N` for no
   - Press Enter

4. **Redirect HTTP to HTTPS?** (recommended!)
   - Type `2` to redirect all HTTP traffic to HTTPS
   - Press Enter

**Certbot will now:**
- ✅ Obtain SSL certificate from Let's Encrypt
- ✅ Update nginx configuration automatically
- ✅ Set up auto-renewal

---

## Step 3: Verify SSL is Working

**Test SSL certificate:**
```bash
sudo certbot certificates
```

You should see your certificate listed with expiration date.

**Test nginx configuration:**
```bash
sudo nginx -t
```

**Restart nginx (if needed):**
```bash
sudo systemctl restart nginx
```

---

## Step 4: Update Environment Variables

Update your `.env` file to use HTTPS:

```bash
cd /var/www/nomad-stop
nano .env
```

**Update this line:**
```bash
NEXT_PUBLIC_SITE_URL="https://nomadstop.co.uk"
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

**Restart PM2:**
```bash
pm2 restart nomad-stop --update-env
```

---

## Step 5: Verify HTTPS is Working

**Test in browser:**
1. Visit: `https://nomadstop.co.uk`
2. You should see a padlock icon 🔒 instead of "not secured"
3. Visit: `https://nomadstop.co.uk/admin`

**Test HTTP redirect:**
- Visit: `http://nomadstop.co.uk`
- Should automatically redirect to `https://nomadstop.co.uk`

---

## Step 6: Verify Auto-Renewal is Set Up

SSL certificates expire every 90 days. Certbot should auto-renew, but let's verify:

**Test renewal:**
```bash
sudo certbot renew --dry-run
```

This will test if auto-renewal works without actually renewing.

**Check renewal schedule:**
```bash
sudo systemctl status certbot.timer
```

Should show "active (running)".

---

## Quick Commands Reference

```bash
# Check SSL certificate status
sudo certbot certificates

# Test renewal (dry run)
sudo certbot renew --dry-run

# Manually renew certificate
sudo certbot renew

# Check nginx status
sudo systemctl status nginx

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# Check if port 443 (HTTPS) is open
sudo ufw status
sudo ufw allow 443/tcp
```

---

## Troubleshooting

### Error: Port 443 not open?

**Open port 443:**
```bash
sudo ufw allow 443/tcp
sudo ufw reload
```

### Error: Domain not resolving?

**Wait for DNS propagation** (15-30 minutes), then check:
```bash
nslookup nomadstop.co.uk
```

### Error: Nginx not configured?

Make sure nginx is configured before running certbot. If not:

1. Update nginx config (from previous steps)
2. Test: `sudo nginx -t`
3. Restart: `sudo systemctl restart nginx`
4. Run certbot again

### Error: Certificate renewal failed?

**Manually renew:**
```bash
sudo certbot renew
sudo systemctl restart nginx
```

---

## What Certbot Does Automatically

When you run `sudo certbot --nginx`, it:

1. ✅ Gets SSL certificate from Let's Encrypt
2. ✅ Updates `/etc/nginx/sites-available/nomad-stop` with SSL configuration
3. ✅ Sets up automatic HTTP → HTTPS redirect
4. ✅ Configures auto-renewal (certificates renew every 90 days)

Your nginx config will be automatically updated to something like:

```nginx
server {
    listen 80;
    server_name nomadstop.co.uk www.nomadstop.co.uk;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name nomadstop.co.uk www.nomadstop.co.uk;
    
    ssl_certificate /etc/letsencrypt/live/nomadstop.co.uk/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nomadstop.co.uk/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        # ... rest of config
    }
}
```

---

## ✅ Checklist

- [ ] Install Certbot
- [ ] Get SSL certificate with certbot
- [ ] Verify SSL is working
- [ ] Update .env file to use HTTPS
- [ ] Restart PM2
- [ ] Test HTTPS in browser
- [ ] Verify auto-renewal is set up

---

## 🎯 After Setup

Your site will be:
- ✅ **Secure** - HTTPS with SSL certificate
- ✅ **Automatic redirect** - HTTP redirects to HTTPS
- ✅ **Auto-renewal** - SSL certificate renews automatically every 90 days
- ✅ **Padlock icon** 🔒 in browser address bar

Your URLs:
- `https://nomadstop.co.uk` ✅
- `https://www.nomadstop.co.uk` ✅
- `https://nomadstop.co.uk/admin` ✅

---

## 🚨 Important Notes

1. **Certificate expires in 90 days** - Auto-renewal is set up, but check periodically
2. **Email notifications** - Let's Encrypt will email you before expiration if renewal fails
3. **Backup** - Certbot creates backups of nginx config before modifying
4. **No downtime** - Certificate renewal doesn't require downtime




