#!/bin/bash

# Find database credentials on the VPS

cd /var/www/nomad-stop

echo "🔍 Searching for database credentials..."
echo ""

# Check if PostgreSQL is installed locally
echo "1️⃣  Checking if PostgreSQL is installed locally..."
if command -v psql >/dev/null 2>&1; then
    echo "✅ PostgreSQL client is installed"
    echo "   Trying to connect to local PostgreSQL..."
    sudo -u postgres psql -l 2>/dev/null || echo "   Could not connect as postgres user"
else
    echo "⚠️  PostgreSQL client not installed"
fi

# Check for common database config files
echo ""
echo "2️⃣  Checking for database config files..."
find /var/www/nomad-stop -name "*.env*" -type f 2>/dev/null | head -5
find /var/www/nomad-stop -name "*database*" -type f 2>/dev/null | head -5

# Check if there's a database running locally
echo ""
echo "3️⃣  Checking for local PostgreSQL service..."
if systemctl is-active --quiet postgresql 2>/dev/null; then
    echo "✅ PostgreSQL service is running"
    echo "   Database might be on localhost:5432"
elif systemctl is-active --quiet postgresql@* 2>/dev/null; then
    echo "✅ PostgreSQL service is running"
else
    echo "⚠️  PostgreSQL service not found locally"
    echo "   Database might be managed by GoDaddy (separate service)"
fi

# Check for any existing .env files with database info
echo ""
echo "4️⃣  Checking existing .env files..."
if [ -f .env ]; then
    echo "✅ .env file exists"
    echo "   Current contents (hiding sensitive data):"
    grep -E "DATABASE|DB_" .env | sed 's/:[^@]*@/:***@/g' | sed 's/=.*postgresql:/=postgresql:***@/g' || echo "   No database variables found"
else
    echo "❌ .env file does not exist"
fi

echo ""
echo "=========================================="
echo "💡 Next Steps:"
echo "=========================================="
echo ""
echo "If PostgreSQL is on localhost:"
echo "  DATABASE_URL=\"postgresql://username:password@localhost:5432/database_name?schema=public\""
echo ""
echo "If database is managed by GoDaddy:"
echo "  1. Go to GoDaddy → Databases section"
echo "  2. Find your PostgreSQL database"
echo "  3. Copy the connection string"
echo ""
echo "Common GoDaddy database locations:"
echo "  - GoDaddy Dashboard → Databases → PostgreSQL"
echo "  - cPanel → Databases → PostgreSQL Databases"
echo "  - Hosting → Databases"
echo ""


