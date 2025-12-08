#!/bin/bash

# Run price update with custom temp directory
# This avoids the /tmp permission issue

cd /var/www/nomad-stop

# Load environment variables
source .env

# Set temp directory to a writable location
export TMPDIR=/var/www/nomad-stop/tmp
mkdir -p "$TMPDIR"

# Run the update script
npm run prices:update-all

