#!/bin/bash
# Clean .env file - Remove ALL DATABASE_URL entries and add correct one

cd /var/www/nomad-stop

echo "🧹 Cleaning .env file..."

# Remove ALL lines containing DATABASE_URL (including those with spaces)
grep -v 'DATABASE_URL' .env > .env.clean

# Add the correct DATABASE_URL at the top
echo 'DATABASE_URL="postgresql://neondb_owner:npg_4BLcy9jEvdhY@ep-wandering-base-abtz4yht-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"' > .env
cat .env.clean >> .env
rm .env.clean

echo "✅ .env file cleaned!"
echo ""
echo "Verify it's correct:"
cat .env | grep DATABASE_URL




