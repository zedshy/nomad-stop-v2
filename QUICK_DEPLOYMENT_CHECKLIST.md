# Quick Deployment Checklist

Use this checklist when deploying a similar Next.js application to a VPS.

## Initial Setup

```bash
# 1. SSH into VPS
ssh username@vps-ip

# 2. Update system
sudo apt update && sudo apt upgrade -y

# 3. Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs

# 4. Install nginx
sudo apt install -y nginx
sudo systemctl start nginx && sudo systemctl enable nginx

# 5. Install PM2
sudo npm install -g pm2

# 6. Install Git (if not installed)
sudo apt install -y git
```

---

## Application Deployment

```bash
# 1. Navigate to web directory
cd /var/www

# 2. Clone repository
sudo git clone https://github.com/username/repo.git app-name
sudo chown -R $USER:$USER /var/www/app-name
cd /var/www/app-name

# 3. Install dependencies
npm install

# 4. Generate Prisma client
npx prisma generate

# 5. Create .env file
nano .env
# Add all required environment variables

# 6. Run migrations
npx prisma migrate deploy

# 7. Build application
npm run build:prod
```

---

## Nginx Configuration

```bash
# 1. Create nginx config
sudo nano /etc/nginx/sites-available/app-name

# 2. Paste configuration (see DEPLOYMENT_GUIDE.md)

# 3. Enable site
sudo ln -sf /etc/nginx/sites-available/app-name /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 4. Test and restart
sudo nginx -t
sudo systemctl restart nginx
```

---

## PM2 Setup

```bash
# 1. Create ecosystem.config.js (see DEPLOYMENT_GUIDE.md)

# 2. Start application
pm2 start ecosystem.config.js

# 3. Save PM2 configuration
pm2 save
pm2 startup
# Run the generated command
```

---

## DNS & SSL

```bash
# 1. Configure DNS at your registrar (A record → VPS IP)

# 2. Wait 15-30 minutes for DNS propagation

# 3. Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# 4. Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 5. Update .env with HTTPS URL
# NEXT_PUBLIC_SITE_URL="https://yourdomain.com"

# 6. Restart PM2
pm2 restart app-name --update-env
```

---

## Updating Application

```bash
cd /var/www/app-name
git pull origin main
npm install
npx prisma generate
npx prisma migrate deploy
npm run build:prod
pm2 restart app-name --update-env
pm2 status
```

---

## Essential Files

### ecosystem.config.js
```javascript
module.exports = {
  apps: [{
    name: 'app-name',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/var/www/app-name',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

### nginx Config
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com vps-ip;

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

---

## Common Issues

### Application not starting
```bash
pm2 logs app-name
pm2 status
```

### Database connection failed
```bash
cat .env | grep DATABASE_URL
npx prisma migrate status
```

### 502 Bad Gateway
```bash
curl http://localhost:3000
sudo nginx -t
pm2 restart app-name
sudo systemctl restart nginx
```

### SSL not working
```bash
sudo certbot certificates
sudo nginx -t
sudo systemctl restart nginx
```

---

## Quick Commands Reference

```bash
# Check status
pm2 status
sudo systemctl status nginx

# View logs
pm2 logs app-name
sudo tail -f /var/log/nginx/error.log

# Restart services
pm2 restart app-name --update-env
sudo systemctl restart nginx

# Test nginx
sudo nginx -t

# Check SSL
sudo certbot certificates
```

---

See **DEPLOYMENT_GUIDE.md** for detailed explanations and troubleshooting.




