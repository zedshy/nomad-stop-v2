#!/bin/bash

# Clear Next.js cache and rebuild

cd /var/www/nomad-stop

echo "🧹 Clearing Next.js cache..."
rm -rf .next

echo "🔨 Rebuilding application..."
npm run build:prod

echo "🔄 Restarting PM2..."
pm2 delete nomad-stop
pm2 start ecosystem.config.js
pm2 save

echo "✅ Done! Check your website now."


