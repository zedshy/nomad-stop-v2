#!/bin/bash

# Fix .env file with correct DATABASE_URL

cd /var/www/nomad-stop

echo "🔧 Fixing .env file..."
echo ""

# Backup current .env
if [ -f .env ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backed up current .env file"
fi

# Check if DATABASE_URL exists
if grep -q "^DATABASE_URL=" .env 2>/dev/null; then
    echo "📋 Current DATABASE_URL (first 80 chars):"
    grep "^DATABASE_URL=" .env | head -c 80
    echo "..."
    echo ""
    echo "⚠️  If it says 'YOUR_PASSWORD', you need to replace it with your actual password"
    echo ""
    read -p "Do you want to edit the .env file now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        nano .env
    fi
else
    echo "❌ DATABASE_URL not found in .env"
    echo ""
    echo "Adding DATABASE_URL template..."
    echo ""
    echo "DATABASE_URL=\"postgresql://neondb_owner:YOUR_PASSWORD@ep-wandering-base-abtz4yht-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require\"" >> .env
    echo "✅ Added DATABASE_URL template"
    echo ""
    echo "⚠️  You need to replace YOUR_PASSWORD with your actual Neon database password"
    echo "   Edit the file: nano .env"
fi

echo ""
echo "🔍 Verifying .env file..."
if [ -f .env ]; then
    echo "✅ .env file exists"
    echo "   File size: $(wc -l < .env) lines"
    if grep -q "DATABASE_URL" .env; then
        echo "✅ DATABASE_URL found"
        if grep "DATABASE_URL" .env | grep -q "YOUR_PASSWORD"; then
            echo "⚠️  DATABASE_URL still contains 'YOUR_PASSWORD' - needs to be replaced!"
        else
            echo "✅ DATABASE_URL looks configured"
        fi
    else
        echo "❌ DATABASE_URL not found"
    fi
fi

echo ""
echo "💡 To get your password:"
echo "   1. Go to Neon dashboard"
echo "   2. Click 'Show password' in the connection modal"
echo "   3. Copy the password"
echo "   4. Edit .env: nano .env"
echo "   5. Replace YOUR_PASSWORD with the actual password"


