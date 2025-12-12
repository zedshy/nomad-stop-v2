#!/bin/bash
# Production Deployment Script for Nomad Stop
# Run this script on your VPS to deploy the application

set -e  # Exit on any error

echo "🚀 Nomad Stop - Production Deployment Script"
echo "============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
  echo -e "${RED}❌ Please do not run this script as root${NC}"
  exit 1
fi

# Step 1: Check if .env exists
echo -e "${YELLOW}📋 Step 1: Checking environment configuration...${NC}"
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Please create .env file first. See PRODUCTION_ENV_SETUP.md for template."
    exit 1
fi

# Check critical environment variables
required_vars=("DATABASE_URL" "ADMIN_PASSWORD" "WORLDPAY_USERNAME" "WORLDPAY_PASSWORD")
missing_vars=()

for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" .env; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo -e "${RED}❌ Missing required environment variables:${NC}"
    printf '%s\n' "${missing_vars[@]}"
    exit 1
fi

echo -e "${GREEN}✅ Environment configuration found${NC}"
echo ""

# Step 2: Install dependencies
echo -e "${YELLOW}📦 Step 2: Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 3: Generate Prisma Client
echo -e "${YELLOW}🔧 Step 3: Generating Prisma Client...${NC}"
npx prisma generate
echo -e "${GREEN}✅ Prisma Client generated${NC}"
echo ""

# Step 4: Run database migrations
echo -e "${YELLOW}🗄️  Step 4: Running database migrations...${NC}"
npx prisma migrate deploy
echo -e "${GREEN}✅ Database migrations completed${NC}"
echo ""

# Step 5: Build application
echo -e "${YELLOW}🏗️  Step 5: Building application for production...${NC}"
npm run build:prod
echo -e "${GREEN}✅ Application built successfully${NC}"
echo ""

# Step 6: Setup PM2 (if installed)
if command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}🔄 Step 6: Setting up PM2 process manager...${NC}"
    
    # Stop existing process if running
    pm2 stop nomad-stop 2>/dev/null || true
    pm2 delete nomad-stop 2>/dev/null || true
    
    # Start new process
    pm2 start npm --name "nomad-stop" -- start
    pm2 save
    
    echo -e "${GREEN}✅ PM2 configured${NC}"
    echo ""
    
    echo -e "${YELLOW}📊 Application Status:${NC}"
    pm2 status nomad-stop
else
    echo -e "${YELLOW}⚠️  PM2 not installed. Starting application directly...${NC}"
    echo "Consider installing PM2 for better process management:"
    echo "  npm install -g pm2"
    echo ""
    
    # Start application in background
    nohup npm start > app.log 2>&1 &
    echo $! > .pid
    echo -e "${GREEN}✅ Application started (PID: $(cat .pid))${NC}"
fi

echo ""
echo "============================================="
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "============================================="
echo ""
echo "📍 Next Steps:"
echo ""
echo "1. Test Admin Login:"
echo "   URL: https://your-domain.com/admin"
echo "   Username: admin"
echo "   Password: (from ADMIN_PASSWORD in .env)"
echo ""
echo "2. Configure Worldpay Webhook:"
echo "   URL: https://your-domain.com/api/payments/worldpay/webhook"
echo "   Events: PAYMENT_AUTHORIZED, PAYMENT_CAPTURED, PAYMENT_CANCELLED, PAYMENT_FAILED"
echo ""
echo "3. Test Payment Processing:"
echo "   Make a test order and verify it appears in admin panel"
echo ""
echo "4. Monitor Logs:"
if command -v pm2 &> /dev/null; then
    echo "   pm2 logs nomad-stop"
else
    echo "   tail -f app.log"
fi
echo ""
echo "📚 For detailed setup instructions, see: PRODUCTION_ENV_SETUP.md"
echo ""



