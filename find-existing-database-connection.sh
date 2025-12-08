#!/bin/bash

# Find how the database was connected earlier

cd /var/www/nomad-stop

echo "🔍 Finding existing database connection..."
echo ""

# Check if DATABASE_URL was set in shell environment
echo "1️⃣  Checking current shell environment..."
echo "DATABASE_URL in shell: ${DATABASE_URL:0:50}..." 2>/dev/null || echo "   Not set in shell"

# Check all .env files
echo ""
echo "2️⃣  Checking all .env files..."
find /var/www/nomad-stop -name ".env*" -type f 2>/dev/null
for envfile in /var/www/nomad-stop/.env*; do
    if [ -f "$envfile" ]; then
        echo ""
        echo "   File: $envfile"
        if grep -q "DATABASE" "$envfile" 2>/dev/null; then
            echo "   Contains DATABASE variables:"
            grep "DATABASE" "$envfile" | sed 's/=.*postgresql:/=postgresql:***@/g' | sed 's/:[^@]*@/:***@/g'
        else
            echo "   No DATABASE variables found"
        fi
    fi
done

# Check if there's a database connection in any config
echo ""
echo "3️⃣  Checking for database config in scripts..."
grep -r "DATABASE_URL\|postgresql" /var/www/nomad-stop/scripts/*.ts 2>/dev/null | head -3

# Check PM2 environment
echo ""
echo "4️⃣  Checking PM2 environment..."
pm2 env 0 2>/dev/null | grep -i database || echo "   No database variables in PM2"

# Check if we can connect using the connection from earlier scripts
echo ""
echo "5️⃣  Testing database connection..."
if [ -n "$DATABASE_URL" ]; then
    echo "   DATABASE_URL is set, testing connection..."
    source .env 2>/dev/null
    if [ -n "$DATABASE_URL" ]; then
        echo "   DATABASE_URL found in .env"
        # Try to get database name from connection string
        echo "$DATABASE_URL" | grep -oP '/([^?]+)' | sed 's/\///' || echo "   Could not parse database name"
    fi
fi

echo ""
echo "=========================================="
echo "💡 Since price updates worked earlier,"
echo "   the database connection exists!"
echo "   We just need to find it."
echo "=========================================="

