# Quick Price Update on VPS

Since the VPS is having memory issues, here are two ways to update prices:

## Method 1: Direct SQL (No Node.js - Recommended)

Run these SQL commands directly on the VPS using `psql`:

```bash
cd /var/www/nomad-stop

# Get database connection string
source .env

# Connect and run updates
psql "$DATABASE_URL" << 'EOF'
UPDATE product_variants SET price = 1495 WHERE id IN (SELECT pv.id FROM product_variants pv JOIN products p ON pv."productId" = p.id WHERE p.name = 'Kabuli Pilau (Lamb Shank)' AND pv.name = 'Standard');
UPDATE product_variants SET price = 1195 WHERE id IN (SELECT pv.id FROM product_variants pv JOIN products p ON pv."productId" = p.id WHERE p.name = 'Mantu' AND pv.name = 'Standard');
UPDATE product_variants SET price = 1095 WHERE id IN (SELECT pv.id FROM product_variants pv JOIN products p ON pv."productId" = p.id WHERE p.name = 'Lamb Karahi' AND pv.name = 'Standard');
UPDATE product_variants SET price = 995 WHERE id IN (SELECT pv.id FROM product_variants pv JOIN products p ON pv."productId" = p.id WHERE p.name = 'Chicken Karahi' AND pv.name IN ('Mild', 'Spicy'));
UPDATE product_variants SET price = 1195 WHERE id IN (SELECT pv.id FROM product_variants pv JOIN products p ON pv."productId" = p.id WHERE p.name = 'Lamb Biryani' AND pv.name = 'Standard');
UPDATE product_variants SET price = 1095 WHERE id IN (SELECT pv.id FROM product_variants pv JOIN products p ON pv."productId" = p.id WHERE p.name = 'Chicken Biryani' AND pv.name = 'Standard');
UPDATE product_variants SET price = 1299 WHERE id IN (SELECT pv.id FROM product_variants pv JOIN products p ON pv."productId" = p.id WHERE p.name IN ('Margherita', 'Pepperoni Pizza', 'Chicken Tikka Pizza', 'Vegetarian Supreme', 'Afghan Special Pizza (Lamb & Chilli)') AND pv.name = '10"');
UPDATE product_variants SET price = 1499 WHERE id IN (SELECT pv.id FROM product_variants pv JOIN products p ON pv."productId" = p.id WHERE p.name IN ('Margherita', 'Pepperoni Pizza', 'Chicken Tikka Pizza', 'Vegetarian Supreme', 'Afghan Special Pizza (Lamb & Chilli)') AND pv.name = '12"');
UPDATE product_variants SET price = 199 WHERE id IN (SELECT pv.id FROM product_variants pv JOIN products p ON pv."productId" = p.id WHERE p.name = 'Chips' AND pv.name = 'Standard');
UPDATE product_variants SET price = 299 WHERE id IN (SELECT pv.id FROM product_variants pv JOIN products p ON pv."productId" = p.id WHERE p.name = 'Garlic Bread' AND pv.name = 'Standard');
UPDATE product_variants SET price = 499 WHERE id IN (SELECT pv.id FROM product_variants pv JOIN products p ON pv."productId" = p.id WHERE p.name = 'Spicy Wings (6pcs)' AND pv.name = 'Standard');
EOF
```

## Method 2: Minimal Node.js Script

If you can get the script file on the VPS:

```bash
cd /var/www/nomad-stop
NODE_OPTIONS="--max-old-space-size=256" npm run prices:quick
```

## After Updating

Restart the application:
```bash
pm2 restart nomad-stop
```


