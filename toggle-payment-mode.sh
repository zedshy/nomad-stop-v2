#!/bin/bash
# Toggle between Worldpay sandbox and production modes

ENV_FILE=".env"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ .env file not found!"
    exit 1
fi

# Check current mode
CURRENT_MODE=$(grep "WORLDPAY_ENVIRONMENT=" "$ENV_FILE" | cut -d '"' -f 2)

echo "🔄 Worldpay Payment Mode Toggler"
echo "================================"
echo ""
echo "Current Mode: $CURRENT_MODE"
echo ""
echo "Select mode:"
echo "  1) Sandbox (Test mode - fake money)"
echo "  2) Production (Live mode - real money)"
echo ""
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        # Switch to sandbox
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' 's/WORLDPAY_ENVIRONMENT="production"/WORLDPAY_ENVIRONMENT="sandbox"/' "$ENV_FILE"
        else
            # Linux
            sed -i 's/WORLDPAY_ENVIRONMENT="production"/WORLDPAY_ENVIRONMENT="sandbox"/' "$ENV_FILE"
        fi
        echo ""
        echo "✅ Switched to SANDBOX mode (test mode)"
        echo ""
        echo "💳 Use these test cards:"
        echo "   Card: 4444333322221111"
        echo "   Expiry: 12/26"
        echo "   CVV: 123"
        echo ""
        echo "🧪 No real money will be charged!"
        ;;
    2)
        # Switch to production
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' 's/WORLDPAY_ENVIRONMENT="sandbox"/WORLDPAY_ENVIRONMENT="production"/' "$ENV_FILE"
        else
            # Linux
            sed -i 's/WORLDPAY_ENVIRONMENT="sandbox"/WORLDPAY_ENVIRONMENT="production"/' "$ENV_FILE"
        fi
        echo ""
        echo "✅ Switched to PRODUCTION mode (live mode)"
        echo ""
        echo "⚠️  WARNING: Real money will be charged!"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🔄 Next Steps:"
echo ""
echo "For LOCAL testing:"
echo "  1. Restart your dev server: npm run dev -- -p 3005"
echo ""
echo "For VPS (live site):"
echo "  1. Copy .env changes to VPS"
echo "  2. Restart: pm2 restart nomad-stop"
echo ""



