#!/bin/bash
# Simple VPS Update Script
# Copy and paste these commands ONE BY ONE on your VPS terminal

cd /var/www/nomad-stop
git pull origin main
npm run build:prod
pm2 restart nomad-stop --update-env
pm2 status




