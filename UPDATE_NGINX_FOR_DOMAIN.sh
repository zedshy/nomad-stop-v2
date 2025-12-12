#!/bin/bash
# Update nginx configuration for nomadstop.co.uk
# Run this on your VPS

echo "🌐 Updating nginx configuration for nomadstop.co.uk..."
echo ""

# Backup existing config
sudo cp /etc/nginx/sites-available/nomad-stop /etc/nginx/sites-available/nomad-stop.backup

# Update nginx configuration
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

# Test configuration
echo "🧪 Testing nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid!"
    echo "🔄 Restarting nginx..."
    sudo systemctl restart nginx
    echo "✅ Nginx restarted successfully!"
    echo ""
    echo "🌐 Your site should now be accessible at:"
    echo "   - http://nomadstop.co.uk"
    echo "   - http://www.nomadstop.co.uk"
    echo "   - http://92.205.231.55"
else
    echo "❌ Nginx configuration has errors. Please check the file."
    exit 1
fi




