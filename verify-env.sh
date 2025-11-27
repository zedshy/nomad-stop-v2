#!/bin/bash
# Verify .env configuration without exposing credentials

set -e

echo "🔍 Verifying .env Configuration"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ .env file exists${NC}"
echo ""

# Required variables
required_vars=(
    "DISABLE_DB"
    "DATABASE_URL"
    "ADMIN_PASSWORD"
    "WORLDPAY_USERNAME"
    "WORLDPAY_PASSWORD"
    "WORLDPAY_ENVIRONMENT"
    "WORLDPAY_WEBHOOK_SECRET"
    "EMAIL_HOST"
    "EMAIL_PORT"
    "EMAIL_USER"
    "EMAIL_PASS"
    "EMAIL_FROM"
    "NEXT_PUBLIC_BASE_URL"
    "NODE_ENV"
)

echo "📋 Checking Required Variables:"
echo "================================"
missing_vars=()
found_vars=()

for var in "${required_vars[@]}"; do
    if grep -q "^${var}=" .env; then
        value=$(grep "^${var}=" .env | cut -d '=' -f2- | tr -d '"')
        if [ -z "$value" ] || [ "$value" = "YOUR_XXX" ] || [[ "$value" == *"YOUR_"* ]]; then
            echo -e "${YELLOW}⚠️  ${var}${NC} - Set but appears to be placeholder"
            missing_vars+=("$var")
        else
            echo -e "${GREEN}✅ ${var}${NC} - Configured"
            found_vars+=("$var")
        fi
    else
        echo -e "${RED}❌ ${var}${NC} - Missing"
        missing_vars+=("$var")
    fi
done

echo ""
echo "================================"
echo "Summary:"
echo "================================"
echo -e "${GREEN}✅ Configured: ${#found_vars[@]}${NC}"
echo -e "${RED}❌ Missing/Incomplete: ${#missing_vars[@]}${NC}"
echo ""

# Specific checks
echo "🔍 Detailed Checks:"
echo "================================"

# Check DISABLE_DB
if grep -q "^DISABLE_DB=false" .env; then
    echo -e "${GREEN}✅ Database enabled (DISABLE_DB=false)${NC}"
elif grep -q "^DISABLE_DB=true" .env; then
    echo -e "${YELLOW}⚠️  Database disabled (DISABLE_DB=true) - Should be 'false' for production${NC}"
fi

# Check DATABASE_URL format
if grep -q "^DATABASE_URL=" .env; then
    db_url=$(grep "^DATABASE_URL=" .env | cut -d '=' -f2- | tr -d '"')
    if [[ "$db_url" == postgresql://* ]]; then
        echo -e "${GREEN}✅ DATABASE_URL format looks correct (PostgreSQL)${NC}"
    elif [[ "$db_url" == *"sqlite"* ]] || [[ "$db_url" == *".db"* ]]; then
        echo -e "${YELLOW}⚠️  DATABASE_URL appears to be SQLite - Should be PostgreSQL for production${NC}"
    else
        echo -e "${RED}❌ DATABASE_URL format may be incorrect${NC}"
    fi
fi

# Check Worldpay environment
if grep -q "^WORLDPAY_ENVIRONMENT=" .env; then
    wp_env=$(grep "^WORLDPAY_ENVIRONMENT=" .env | cut -d '=' -f2- | tr -d '"')
    if [ "$wp_env" = "production" ]; then
        echo -e "${GREEN}✅ Worldpay environment: production${NC}"
    elif [ "$wp_env" = "sandbox" ]; then
        echo -e "${YELLOW}⚠️  Worldpay environment: sandbox (Use 'production' for live)${NC}"
    fi
fi

# Check NODE_ENV
if grep -q "^NODE_ENV=" .env; then
    node_env=$(grep "^NODE_ENV=" .env | cut -d '=' -f2- | tr -d '"')
    if [ "$node_env" = "production" ]; then
        echo -e "${GREEN}✅ Node environment: production${NC}"
    else
        echo -e "${YELLOW}⚠️  Node environment: $node_env (Should be 'production' for live)${NC}"
    fi
fi

# Check email configuration
if grep -q "^EMAIL_HOST=" .env && grep -q "^EMAIL_USER=" .env; then
    echo -e "${GREEN}✅ Email configuration present${NC}"
fi

# Check base URL
if grep -q "^NEXT_PUBLIC_BASE_URL=" .env; then
    base_url=$(grep "^NEXT_PUBLIC_BASE_URL=" .env | cut -d '=' -f2- | tr -d '"')
    if [[ "$base_url" == https://* ]]; then
        echo -e "${GREEN}✅ Base URL uses HTTPS${NC}"
    else
        echo -e "${YELLOW}⚠️  Base URL should use HTTPS for production${NC}"
    fi
fi

echo ""
echo "================================"

if [ ${#missing_vars[@]} -eq 0 ]; then
    echo -e "${GREEN}🎉 All required variables are configured!${NC}"
    echo ""
    echo "✅ Your .env file looks good for production!"
    echo ""
    echo "📝 Next steps:"
    echo "  1. Run database migrations: npx prisma migrate deploy"
    echo "  2. Build the application: npm run build:prod"
    echo "  3. Start the application: pm2 restart nomad-stop"
    exit 0
else
    echo -e "${YELLOW}⚠️  Please review the missing/incomplete variables above${NC}"
    echo ""
    echo "Missing or incomplete variables:"
    printf '%s\n' "${missing_vars[@]}" | sed 's/^/  - /'
    echo ""
    echo "Edit your .env file: nano .env"
    exit 1
fi

