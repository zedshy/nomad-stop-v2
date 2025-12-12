# Point Domain to VPS - Complete Guide

This guide will help you point your domain name to your VPS IP address: `92.205.231.55`

## Step 1: Configure DNS at Your Domain Registrar

### Option A: If your domain is with GoDaddy

1. **Log in to GoDaddy**
   - Go to https://www.godaddy.com
   - Click "Sign In" at the top right
   - Enter your credentials

2. **Access DNS Management**
   - Go to "My Products"
   - Find your domain name
   - Click on "DNS" (or "Manage DNS")

3. **Add/Update A Record**
   - Look for existing "A" records
   - Click "Add" or edit existing "A" record
   - Set the following:
     ```
     Type: A
     Name: @ (or leave blank for root domain)
     Value: 92.205.231.55
     TTL: 600 (or Default)
     ```
   - Click "Save"

4. **Add WWW Subdomain (Optional but Recommended)**
   - Add another A record:
     ```
     Type: A
     Name: www
     Value: 92.205.231.55
     TTL: 600
     ```
   - Click "Save"

5. **Wait for DNS Propagation**
   - DNS changes can take 5 minutes to 48 hours
   - Usually works within 15-30 minutes
   - Check with: `nslookup yourdomain.com` or `dig yourdomain.com`

### Option B: If your domain is with another registrar

The process is similar:
1. Log in to your domain registrar
2. Find DNS Management / DNS Settings
3. Add/Edit A record pointing to `92.205.231.55`
4. Save changes

---

## Step 2: Update Nginx Configuration on VPS

After DNS is configured, update nginx to handle your domain:

**SSH into your VPS:**
```bash
ssh nomadadmin@92.205.231.55
```

**Create/Update nginx config:**
```bash
cd /var/www/nomad-stop
sudo nano /etc/nginx/sites-available/nomad-stop
```

**Replace with this configuration (replace `yourdomain.com` with your actual domain):**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com 92.205.231.55;

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

**Save and exit** (Ctrl+X, then Y, then Enter)

**Enable the site and test:**
```bash
sudo ln -sf /etc/nginx/sites-available/nomad-stop /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
```

**If test is successful, restart nginx:**
```bash
sudo systemctl restart nginx
```

---

## Step 3: Set Up SSL/HTTPS (Recommended)

To enable HTTPS with a free SSL certificate using Let's Encrypt:

**Install Certbot:**
```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

**Get SSL Certificate:**
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**Follow the prompts:**
- Enter your email address
- Agree to terms of service
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

**Auto-renewal is set up automatically!**

---

## Step 4: Update Environment Variables

Update your `.env` file on the VPS:

```bash
cd /var/www/nomad-stop
nano .env
```

**Update or add:**
```bash
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
```

**Save and restart PM2:**
```bash
pm2 restart nomad-stop --update-env
```

---

## Step 5: Verify Everything Works

1. **Check DNS:**
   ```bash
   nslookup yourdomain.com
   # Should return: 92.205.231.55
   ```

2. **Test domain access:**
   - Visit: `http://yourdomain.com` (or `https://yourdomain.com` if SSL is set up)
   - Should see your Nomad Stop website

3. **Test admin panel:**
   - Visit: `http://yourdomain.com/admin` (or `https://yourdomain.com/admin`)
   - Should see admin login page

---

## Quick Reference Commands

```bash
# Check if nginx is running
sudo systemctl status nginx

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# Check DNS
nslookup yourdomain.com
dig yourdomain.com

# Check SSL certificate
sudo certbot certificates

# Renew SSL certificate manually (if needed)
sudo certbot renew

# Check PM2 status
pm2 status
```

---

## Troubleshooting

### Domain not resolving?
- Wait 15-30 minutes for DNS propagation
- Clear your browser cache
- Try from a different network/device
- Use: `nslookup yourdomain.com` to verify

### 502 Bad Gateway error?
- Check if PM2 is running: `pm2 status`
- Check if app is listening: `curl http://localhost:3000`
- Check nginx logs: `sudo tail -f /var/log/nginx/error.log`

### SSL not working?
- Make sure port 443 is open: `sudo ufw allow 443`
- Check nginx config: `sudo nginx -t`
- Verify certificate: `sudo certbot certificates`

---

## Next Steps

Once your domain is working:
1. ✅ Update all links to use your domain
2. ✅ Test admin panel at `/admin`
3. ✅ Test checkout process
4. ✅ Test email notifications (if configured)




