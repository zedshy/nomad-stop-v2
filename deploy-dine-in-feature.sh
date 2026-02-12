#!/bin/bash
# Deploy Dine In and Take Away feature to production VPS

HOST="92.205.231.55"
USER="nomadadmin"

echo "🚀 Deploying Dine In & Take Away Feature"
echo "=========================================="
echo ""

ssh $USER@$HOST << 'ENDSSH'
cd /var/www/nomad-stop

echo "1️⃣  Pulling latest code from GitHub..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Git pull failed!"
    exit 1
fi

echo ""
echo "2️⃣  Running database migration (adding dine_in to FulfilmentType enum)..."
npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo "⚠️  Migration deploy failed, trying direct SQL..."
    psql $DATABASE_URL -c "ALTER TYPE \"FulfilmentType\" ADD VALUE IF NOT EXISTS 'dine_in';" 2>/dev/null || echo "SQL migration may have already been applied"
fi

echo ""
echo "3️⃣  Generating Prisma client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Prisma generate failed!"
    exit 1
fi

echo ""
echo "4️⃣  Stopping PM2 application..."
pm2 stop nomad-stop

echo ""
echo "5️⃣  Rebuilding application..."
npm run build:prod

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    pm2 start nomad-stop
    exit 1
fi

echo ""
echo "6️⃣  Restarting PM2 application..."
pm2 restart nomad-stop

echo ""
echo "7️⃣  Checking PM2 status..."
pm2 status

echo ""
echo "✅ Deployment complete!"
echo ""
echo "The Dine In and Take Away feature is now live!"
echo "Visit your website to see the new buttons on the homepage."
ENDSSH
