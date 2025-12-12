#!/bin/bash

# Add DATABASE_URL to .env file if missing

cd /var/www/nomad-stop

echo "🔍 Checking .env file..."

if [ ! -f .env ]; then
    echo "❌ .env file does not exist!"
    echo "Creating from template..."
    cp env-template.txt .env
    echo "⚠️  Please edit .env and add your DATABASE_URL"
    exit 1
fi

if grep -q "^DATABASE_URL=" .env; then
    echo "✅ DATABASE_URL already exists in .env"
    grep "^DATABASE_URL=" .env | head -c 60
    echo "..."
else
    echo "❌ DATABASE_URL not found in .env"
    echo ""
    echo "Please add DATABASE_URL to your .env file."
    echo ""
    echo "The format should be:"
    echo "DATABASE_URL=\"postgresql://username:password@host:port/database?schema=public\""
    echo ""
    echo "To add it manually, run:"
    echo "nano .env"
    echo ""
    echo "Or if you know your database details, I can help you construct it."
    echo ""
    read -p "Do you know your database connection details? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Database host (usually localhost): " db_host
        read -p "Database port (usually 5432): " db_port
        read -p "Database name: " db_name
        read -p "Database username: " db_user
        read -sp "Database password: " db_pass
        echo
        
        db_host=${db_host:-localhost}
        db_port=${db_port:-5432}
        
        echo "" >> .env
        echo "DATABASE_URL=\"postgresql://${db_user}:${db_pass}@${db_host}:${db_port}/${db_name}?schema=public\"" >> .env
        echo "✅ Added DATABASE_URL to .env"
    fi
fi

echo ""
echo "🔍 Current .env file (first 10 lines):"
head -10 .env


