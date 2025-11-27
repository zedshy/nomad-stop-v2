#!/bin/bash
# Interactive .env File Creator for Nomad Stop
# This script helps you create your .env file securely

set -e

echo "🔐 Nomad Stop - Secure Environment Setup"
echo "=========================================="
echo ""
echo "This script will help you create your .env file securely."
echo "Your credentials will NOT be displayed or logged."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Check if .env already exists
if [ -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file already exists!${NC}"
    read -p "Do you want to overwrite it? (yes/no): " overwrite
    if [ "$overwrite" != "yes" ]; then
        echo "Exiting without changes."
        exit 0
    fi
    # Backup existing .env
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo -e "${GREEN}✅ Backed up existing .env${NC}"
fi

echo ""
echo "📋 Please provide the following information:"
echo "=============================================="
echo ""

# Database Configuration
echo -e "${CYAN}=== DATABASE CONFIGURATION ===${NC}"
read -p "Database Host (default: localhost): " db_host
db_host=${db_host:-localhost}

read -p "Database Port (default: 5432): " db_port
db_port=${db_port:-5432}

read -p "Database Name (default: nomadstop): " db_name
db_name=${db_name:-nomadstop}

read -p "Database Username: " db_user
read -sp "Database Password: " db_pass
echo ""

DATABASE_URL="postgresql://${db_user}:${db_pass}@${db_host}:${db_port}/${db_name}?schema=public"

echo ""
echo -e "${CYAN}=== ADMIN CONFIGURATION ===${NC}"
read -sp "Admin Password (create a secure password): " admin_password
echo ""
read -sp "Confirm Admin Password: " admin_password_confirm
echo ""

if [ "$admin_password" != "$admin_password_confirm" ]; then
    echo -e "${RED}❌ Passwords don't match!${NC}"
    exit 1
fi

echo ""
echo -e "${CYAN}=== WORLDPAY CONFIGURATION ===${NC}"
read -p "Worldpay Username: " worldpay_username
read -sp "Worldpay Password: " worldpay_password
echo ""
read -p "Worldpay Environment (production/sandbox, default: production): " worldpay_env
worldpay_env=${worldpay_env:-production}

read -p "Worldpay Webhook Secret: " worldpay_webhook_secret
read -p "Worldpay Entity ID (optional): " worldpay_entity_id
read -p "Worldpay Checkout ID (optional): " worldpay_checkout_id

echo ""
echo -e "${CYAN}=== EMAIL CONFIGURATION ===${NC}"
read -p "Email Host (default: smtp.gmail.com): " email_host
email_host=${email_host:-smtp.gmail.com}

read -p "Email Port (default: 587): " email_port
email_port=${email_port:-587}

read -p "Email Username/Address: " email_user
read -sp "Email Password/App Password: " email_pass
echo ""

read -p "Email From Address (default: Nomad Stop <noreply@nomadstop.com>): " email_from
email_from=${email_from:-"Nomad Stop <noreply@nomadstop.com>"}

echo ""
echo -e "${CYAN}=== APPLICATION CONFIGURATION ===${NC}"
read -p "Website URL (e.g., https://www.nomadstop.com): " base_url

# Create .env file
echo ""
echo -e "${YELLOW}📝 Creating .env file...${NC}"

cat > .env << EOF
# ============================================
# NOMAD STOP - PRODUCTION ENVIRONMENT
# ============================================
# Generated on: $(date)
# IMPORTANT: Keep this file secure and never commit to git!
# ============================================

# DATABASE CONFIGURATION
DISABLE_DB=false
DATABASE_URL="${DATABASE_URL}"

# ADMIN CONFIGURATION
ADMIN_PASSWORD="${admin_password}"

# WORLDPAY PAYMENT CONFIGURATION
WORLDPAY_USERNAME="${worldpay_username}"
WORLDPAY_PASSWORD="${worldpay_password}"
WORLDPAY_ENVIRONMENT="${worldpay_env}"
WORLDPAY_WEBHOOK_SECRET="${worldpay_webhook_secret}"
WORLDPAY_ENTITY_ID="${worldpay_entity_id}"
WORLDPAY_CHECKOUT_ID="${worldpay_checkout_id}"

# EMAIL CONFIGURATION
EMAIL_HOST="${email_host}"
EMAIL_PORT="${email_port}"
EMAIL_USER="${email_user}"
EMAIL_PASS="${email_pass}"
EMAIL_FROM="${email_from}"

# APPLICATION CONFIGURATION
NEXT_PUBLIC_BASE_URL="${base_url}"
NODE_ENV="production"
EOF

# Secure the file
chmod 600 .env

echo ""
echo "=============================================="
echo -e "${GREEN}✅ .env file created successfully!${NC}"
echo "=============================================="
echo ""
echo "📋 Configuration Summary:"
echo "  - Database: ${db_name} on ${db_host}:${db_port}"
echo "  - Worldpay Environment: ${worldpay_env}"
echo "  - Email: ${email_user}"
echo "  - Base URL: ${base_url}"
echo ""
echo "🔒 Security:"
echo "  - File permissions: 600 (owner read/write only)"
echo "  - Location: $(pwd)/.env"
echo ""
echo "📝 Next Steps:"
echo "  1. Verify your .env file: cat .env"
echo "  2. Run migrations: npx prisma migrate deploy"
echo "  3. Build application: npm run build:prod"
echo "  4. Start application: npm start"
echo ""
echo "  Or use the automated deployment script:"
echo "  ./deploy-production.sh"
echo ""
echo -e "${YELLOW}⚠️  Remember:${NC}"
echo "  - Never commit .env to git"
echo "  - Keep your credentials secure"
echo "  - Rotate passwords regularly"
echo ""

