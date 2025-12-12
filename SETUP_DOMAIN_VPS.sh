#!/bin/bash
# Domain Setup Script for VPS
# Run this on your VPS after DNS is configured

DOMAIN="yourdomain.com"  # Replace with your actual domain

echo "🌐 Setting up domain: $DOMAIN"
echo ""

# Step 1: Update nginx configuration
echo "📝 Updating nginx configuration..."
sudo tee /etc/nginx/sites-available/nomad-stop > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN 92.205.231.55;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Step 2: Enable site
echo "🔗 Enabling nginx site..."
sudo ln -sf /etc/nginx/sites-available/nomad-stop /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Step 3: Test nginx configuration
echo "🧪 Testing nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid!"
    echo "🔄 Restarting nginx..."
    sudo systemctl restart nginx
    echo "✅ Nginx restarted!"
else
    echo "❌ Nginx configuration has errors. Please check the file."
    exit 1
fi

# Step 4: Update .env file
echo "📝 Updating .env file..."
cd /var/www/nomad-stop

# Check if NEXT_PUBLIC_SITE_URL exists
if grep -q "NEXT_PUBLIC_SITE_URL" .env; then
    # Update existing entry
    sed -i "s|NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=\"https://$DOMAIN\"|" .env
else
    # Add new entry
    echo "" >> .env
    echo "NEXT_PUBLIC_SITE_URL=\"https://$DOMAIN\"" >> .env
fi

echo "✅ .env file updated!"

# Step 5: Restart PM2 with new environment
echo "🔄 Restarting PM2..."
pm2 restart nomad-stop --update-env

echo ""
echo "✅ Domain setup complete!"
echo ""
echo "🌐 Your site should now be accessible at:"
echo "   - http://$DOMAIN"
echo "   - http://www.$DOMAIN"
echo "   - http://92.205.231.55"
echo ""
echo "📋 Next steps:"
echo "   1. Wait for DNS propagation (15-30 minutes)"
echo "   2. Test: nslookup $DOMAIN (should return 92.205.231.55)"
echo "   3. Set up SSL with: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"




