#!/bin/bash

# Verify prices were actually updated in the database

cd /var/www/nomad-stop
source .env

echo "🔍 Verifying prices in database..."
echo ""

# Check some key prices
psql "$DATABASE_URL" << 'EOF'
SELECT 
    p.name as product_name,
    pv.name as variant_name,
    pv.price as price_pence,
    ROUND(pv.price::numeric / 100, 2) as price_pounds
FROM products p
JOIN product_variants pv ON pv."productId" = p.id
WHERE p.name IN (
    'Kabuli Pilau (Lamb Shank)',
    'Mantu',
    'Lamb Biryani',
    'Chicken Biryani',
    'Lamb Karahi',
    'Chicken Karahi',
    'Margherita',
    'Chips'
)
ORDER BY p.name, pv.name;
EOF


