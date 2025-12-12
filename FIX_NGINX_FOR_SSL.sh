#!/bin/bash
# Fix nginx configuration for SSL certificate installation
# Run this on your VPS

echo "🔧 Fixing nginx configuration for SSL..."
echo ""

# Backup existing config
sudo cp /etc/nginx/sites-available/nomad-stop /etc/nginx/sites-available/nomad-stop.backup.$(date +%Y%m%d_%H%M%S)

# Update nginx configuration with proper server_name
sudo tee /etc/nginx/sites-available/nomad-stop > /dev/null <<'EOF'
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
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/nomad-stop /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid!"
    echo "🔄 Restarting nginx..."
    sudo systemctl restart nginx
    echo "✅ Nginx restarted successfully!"
    echo ""
    echo "🔒 Now installing SSL certificate..."
    echo ""
    echo "Run this command:"
    echo "   sudo certbot install --cert-name nomadstop.co.uk"
    echo ""
    echo "Or re-run certbot to auto-configure:"
    echo "   sudo certbot --nginx -d nomadstop.co.uk -d www.nomadstop.co.uk"
else
    echo "❌ Nginx configuration has errors. Please check the file."
    exit 1
fi




