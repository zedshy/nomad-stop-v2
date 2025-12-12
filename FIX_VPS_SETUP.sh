#!/bin/bash
# Fix VPS Setup - Copy and paste these commands one by one in your VPS terminal

echo "Step 1: Check if project directory exists"
ls -la /var/www/nomad-stop

echo ""
echo "Step 2: Navigate to project directory"
cd /var/www/nomad-stop

echo ""
echo "Step 3: Check current directory"
pwd

echo ""
echo "Step 4: Check if it's a git repository"
ls -la .git 2>/dev/null || echo "Not a git repository"

echo ""
echo "Step 5: Check if ecosystem.config.js exists"
ls -la ecosystem.config.js 2>/dev/null || echo "File not found"

echo ""
echo "Step 6: If directory exists but no git, initialize and pull"
echo "If directory is empty, clone the repo"
echo "If directory has files but no git, remove and clone"




