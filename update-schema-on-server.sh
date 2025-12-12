#!/bin/bash
# Update schema and run migration on server

HOST="92.205.231.55"
USER="nomadadmin"

echo "🔄 Updating Schema and Running Migration"
echo "=========================================="
echo ""

ssh $USER@$HOST << 'ENDSSH'
cd /var/www/nomad-stop

echo "1. Pulling latest code from git..."
git pull origin main

echo ""
echo "2. Checking if schema.prisma has the new fields..."
if grep -q "sortOrder" prisma/schema.prisma && grep -q "imageUrl" prisma/schema.prisma; then
    echo "✅ Schema has sortOrder and imageUrl fields"
else
    echo "❌ Schema doesn't have the new fields yet"
    echo "Current schema fields:"
    grep -A 10 "model Product" prisma/schema.prisma | head -15
    exit 1
fi

echo ""
echo "3. Generating Prisma client..."
npx prisma generate

echo ""
echo "4. Creating migration..."
npx prisma migrate dev --name add_sort_order_and_image_url

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed!"
else
    echo ""
    echo "⚠️  If migration says 'Already in sync', the columns might already exist."
    echo "Checking database columns..."
    echo ""
    echo "You can verify by checking the database directly or running:"
    echo "  npx prisma db pull"
fi

echo ""
echo "5. Restarting the application..."
pm2 restart nomad-stop || echo "PM2 not running or app not found"

echo ""
echo "✅ Done!"
ENDSSH

