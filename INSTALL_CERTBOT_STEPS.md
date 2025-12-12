# Install Certbot - Step by Step

The error "command not found" means Certbot isn't installed yet. Follow these steps:

## Step 1: Update Package List

On your VPS terminal, run:

```bash
sudo apt update
```

Wait for it to complete. You should see a message like "All packages are up to date."

---

## Step 2: Install Certbot

After `apt update` completes, run:

```bash
sudo apt install -y certbot python3-certbot-nginx
```

This will:
- Install Certbot (the SSL certificate tool)
- Install the nginx plugin for Certbot
- Take a few minutes to download and install

**Wait for it to complete!** You'll see messages like:
- "Setting up certbot..."
- "Processing triggers..."
- When finished, you'll see your command prompt again

---

## Step 3: Verify Certbot is Installed

Test that Certbot is now available:

```bash
certbot --version
```

You should see something like:
```
certbot 2.x.x
```

If you still get "command not found", try:
```bash
which certbot
/usr/bin/certbot
```

---

## Step 4: Get SSL Certificate

Once Certbot is installed, run:

```bash
sudo certbot --nginx -d nomadstop.co.uk -d www.nomadstop.co.uk
```

Follow the prompts as described in the SSL setup guide.

---

## Common Issues

### Issue: "Unable to acquire lock"

If you see an error about "Unable to acquire lock", another apt process is running. Wait a few minutes and try again.

### Issue: "Package not found"

Make sure you ran `sudo apt update` first. If it still fails, try:
```bash
sudo apt update && sudo apt install -y certbot python3-certbot-nginx
```

### Issue: Installation is slow

This is normal. Certbot installation can take 2-5 minutes. Just wait for it to complete.

---

## Quick Command Summary

Run these commands **one by one** and wait for each to complete:

```bash
# Step 1: Update packages
sudo apt update

# Step 2: Install Certbot (wait for this to complete!)
sudo apt install -y certbot python3-certbot-nginx

# Step 3: Verify installation
certbot --version

# Step 4: Get SSL certificate
sudo certbot --nginx -d nomadstop.co.uk -d www.nomadstop.co.uk
```




