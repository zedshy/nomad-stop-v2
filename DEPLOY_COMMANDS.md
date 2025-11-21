# VPS Deployment Commands

## Step 1: SSH into your VPS
```bash
ssh nomadadmin@92.205.231.55
# Password: Nomad133@
```

## Step 2: Once connected, run these commands one by one:

### Update system
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### Install PM2, Nginx, Git
```bash
sudo npm install -g pm2
sudo apt install -y nginx git
```

### Setup project
```bash
sudo mkdir -p /var/www/nomad-stop
sudo chown -R $USER:$USER /var/www/nomad-stop
cd /var/www/nomad-stop
git clone https://github.com/zedshy/nomad-stop-v2.git .
```

### Install dependencies
```bash
npm install --production
npx prisma generate
```

### Create .env file
```bash
nano .env
```
(Add your environment variables, then save: Ctrl+X, Y, Enter)

### Run migrations
```bash
npx prisma migrate deploy
```

### Build application
```bash
npm run build
```

### Start with PM2
```bash
pm2 start ecosystem.config.js
pm2 save
```

### Setup Nginx
```bash
sudo tee /etc/nginx/sites-available/nomad-stop > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name 92.205.231.55;
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
NGINXEOF

sudo ln -sf /etc/nginx/sites-available/nomad-stop /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### Setup firewall
```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable
```

### Check status
```bash
pm2 status
```

## Done! Your site should be live at: http://92.205.231.55
