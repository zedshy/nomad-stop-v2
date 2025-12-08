#!/bin/bash

# Quick command to set DATABASE_URL on VPS
# Run this on the VPS after pulling latest code

cd /var/www/nomad-stop

# Backup .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

# Remove old DATABASE_URL if exists
sed -i '/^DATABASE_URL=/d' .env 2>/dev/null || true

# Add new DATABASE_URL
echo 'DATABASE_URL="postgresql://neondb_owner:npg_4BLcy9jEvdhY@ep-wandering-base-abtz4yht-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"' >> .env

echo "✅ DATABASE_URL updated in .env"
echo ""
echo "Verifying..."
grep "^DATABASE_URL=" .env | head -c 80
echo "..."
echo ""
echo "✅ Done! Now restart PM2:"
echo "   pm2 restart nomad-stop"
echo "   pm2 logs nomad-stop --lines 20"

