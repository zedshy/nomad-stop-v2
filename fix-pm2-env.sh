#!/bin/bash

# Fix PM2 environment variables

cd /var/www/nomad-stop

echo "🔍 Checking .env file..."
if [ -f .env ]; then
    echo "✅ .env file exists"
    if grep -q "DATABASE_URL" .env; then
        echo "✅ DATABASE_URL found in .env"
        # Show first few chars (don't show full password)
        grep "DATABASE_URL" .env | head -c 50
        echo "..."
    else
        echo "❌ DATABASE_URL NOT found in .env!"
    fi
    
    if grep -q "DISABLE_DB" .env; then
        echo "DISABLE_DB value:"
        grep "DISABLE_DB" .env
    else
        echo "⚠️  DISABLE_DB not set (will default to false)"
    fi
else
    echo "❌ .env file does not exist!"
fi

echo ""
echo "🔄 Restarting PM2 with environment variables..."
pm2 delete nomad-stop

# Load .env and start PM2 with explicit env vars
source .env
pm2 start ecosystem.config.js --update-env
pm2 save

echo ""
echo "🔍 Checking PM2 environment..."
pm2 env 0 | grep -E "DATABASE_URL|DISABLE_DB" || echo "Environment variables not found in PM2"

echo ""
echo "📋 Checking recent logs for database connection..."
pm2 logs nomad-stop --lines 10 --nostream | grep -i "database\|error\|mock" || echo "No recent errors"


