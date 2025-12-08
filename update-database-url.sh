#!/bin/bash

# Update DATABASE_URL in .env file on VPS
# Usage: bash update-database-url.sh "postgresql://user:pass@host/db"

cd /var/www/nomad-stop

if [ -z "$1" ]; then
    echo "❌ Error: Please provide the DATABASE_URL as an argument"
    echo ""
    echo "Usage:"
    echo "  bash update-database-url.sh \"postgresql://user:pass@host/db\""
    echo ""
    echo "Or set it directly:"
    echo "  DATABASE_URL=\"your-connection-string\" bash update-database-url.sh"
    exit 1
fi

DATABASE_URL="$1"

# Backup .env
if [ -f .env ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backed up .env file"
fi

# Remove old DATABASE_URL line if it exists
if grep -q "^DATABASE_URL=" .env 2>/dev/null; then
    sed -i '/^DATABASE_URL=/d' .env
    echo "✅ Removed old DATABASE_URL"
fi

# Add new DATABASE_URL
echo "DATABASE_URL=\"$DATABASE_URL\"" >> .env
echo "✅ Added new DATABASE_URL"

# Verify
echo ""
echo "🔍 Verification:"
if grep -q "^DATABASE_URL=" .env; then
    echo "✅ DATABASE_URL found in .env"
    echo ""
    echo "First 80 characters (password hidden):"
    grep "^DATABASE_URL=" .env | sed 's/:[^:@]*@/:***@/' | head -c 80
    echo "..."
else
    echo "❌ DATABASE_URL not found - something went wrong"
    exit 1
fi

echo ""
echo "✅ Done! Now restart PM2:"
echo "   pm2 restart nomad-stop"
echo "   pm2 logs nomad-stop --lines 20"

