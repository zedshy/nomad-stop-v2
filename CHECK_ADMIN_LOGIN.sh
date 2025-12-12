#!/bin/bash
# Check Admin Login Details from .env file
# Run this on your VPS

echo "🔍 Checking admin login details..."
echo ""

cd /var/www/nomad-stop

if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    exit 1
fi

echo "📋 Admin Login Details:"
echo ""

# Check for ADMIN_PASSWORD
ADMIN_PASSWORD=$(grep "^ADMIN_PASSWORD=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")

if [ -z "$ADMIN_PASSWORD" ]; then
    echo "⚠️  ADMIN_PASSWORD is not set in .env file"
    echo "🔑 Default password: change-me"
    echo ""
    echo "Login with:"
    echo "  Email: (any email or leave blank)"
    echo "  Password: change-me"
else
    echo "✅ ADMIN_PASSWORD found!"
    echo ""
    echo "🔑 Admin Password: $ADMIN_PASSWORD"
    echo ""
    echo "Login with:"
    echo "  Email: (any email or leave blank)"
    echo "  Password: $ADMIN_PASSWORD"
fi

echo ""
echo "---"
echo ""
echo "📍 Admin login URL:"
echo "  https://nomadstop.co.uk/admin"
echo "  or"
echo "  http://nomadstop.co.uk/admin"




