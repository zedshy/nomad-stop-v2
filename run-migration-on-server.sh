#!/bin/bash
# Run database migration on the server

HOST="92.205.231.55"
USER="nomadadmin"

echo "🔄 Running Database Migration on Server"
echo "========================================"
echo ""

ssh $USER@$HOST << 'ENDSSH'
cd /var/www/nomad-stop

echo "Current directory: $(pwd)"
echo ""

# Check if prisma schema exists
if [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ Error: prisma/schema.prisma not found!"
    echo "Make sure you're in the project directory"
    exit 1
fi

echo "✅ Found Prisma schema"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found. Installing dependencies..."
    npm install
fi

echo ""
echo "Running Prisma migration..."
echo ""

# Generate migration
npx prisma migrate dev --name add_sort_order_and_image_url

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "New fields added:"
    echo "  - sortOrder (Int, default: 0)"
    echo "  - imageUrl (String, optional)"
else
    echo ""
    echo "❌ Migration failed. Check the error above."
    echo ""
    echo "If you see 'database is not empty', you may need to:"
    echo "  1. Use 'prisma migrate deploy' instead (for production)"
    echo "  2. Or manually add the columns via SQL"
fi
ENDSSH

