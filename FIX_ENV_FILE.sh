#!/bin/bash
# Fix .env file on VPS - Remove duplicates and fix DATABASE_URL

cd /var/www/nomad-stop

echo "📋 Current .env file has multiple DATABASE_URL entries"
echo ""

# Backup current .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

echo "✅ Backup created: .env.backup.*"
echo ""
echo "Now you need to manually edit .env to have only ONE DATABASE_URL"
echo ""
echo "Run this command to edit:"
echo "nano .env"
echo ""
echo "Remove these duplicate lines:"
echo "  DATABASE_URL=\"file:/var/www/nomad-stop/prisma/dev.db\""
echo ""
echo "Keep ONLY this one (make sure it's complete):"
echo "  DATABASE_URL=\"postgresql://neondb_owner:npg_4BLcy9jEvdhY@ep-wandering-base-abtz4yht-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require\""
echo ""
echo "Save with: Ctrl+X, Y, Enter"




