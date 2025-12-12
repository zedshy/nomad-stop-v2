#!/bin/bash

# Run price update with proper environment variable loading

cd /var/www/nomad-stop

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Verify DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not found in .env file"
    echo "Please check your .env file"
    exit 1
fi

# Set temp directory to a writable location
export TMPDIR=/var/www/nomad-stop/tmp
mkdir -p "$TMPDIR"

# Run the update script with DATABASE_URL explicitly set
DATABASE_URL="$DATABASE_URL" npm run prices:update-all


