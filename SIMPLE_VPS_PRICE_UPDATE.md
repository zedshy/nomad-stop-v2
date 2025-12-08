# Simple Price Updates for VPS

Based on GoDaddy's feedback, PostgreSQL is killing queries due to resource limits. Use these simpler queries that run one at a time.

## Method: Run Each Query Individually

On the VPS, run these commands **one at a time**, waiting a few seconds between each:

```bash
cd /var/www/nomad-stop
source .env
```

Then run each UPDATE statement individually:

```bash
psql "$DATABASE_URL" -c "UPDATE product_variants SET price = 1495 FROM products WHERE product_variants.\"productId\" = products.id AND products.name = 'Kabuli Pilau (Lamb Shank)' AND product_variants.name = 'Standard';"
```

```bash
psql "$DATABASE_URL" -c "UPDATE product_variants SET price = 1195 FROM products WHERE product_variants.\"productId\" = products.id AND products.name = 'Mantu' AND product_variants.name = 'Standard';"
```

```bash
psql "$DATABASE_URL" -c "UPDATE product_variants SET price = 1095 FROM products WHERE product_variants.\"productId\" = products.id AND products.name = 'Lamb Karahi' AND product_variants.name = 'Standard';"
```

```bash
psql "$DATABASE_URL" -c "UPDATE product_variants SET price = 995 FROM products WHERE product_variants.\"productId\" = products.id AND products.name = 'Chicken Karahi' AND product_variants.name = 'Mild';"
```

```bash
psql "$DATABASE_URL" -c "UPDATE product_variants SET price = 995 FROM products WHERE product_variants.\"productId\" = products.id AND products.name = 'Chicken Karahi' AND product_variants.name = 'Spicy';"
```

```bash
psql "$DATABASE_URL" -c "UPDATE product_variants SET price = 1195 FROM products WHERE product_variants.\"productId\" = products.id AND products.name = 'Lamb Biryani' AND product_variants.name = 'Standard';"
```

```bash
psql "$DATABASE_URL" -c "UPDATE product_variants SET price = 1095 FROM products WHERE product_variants.\"productId\" = products.id AND products.name = 'Chicken Biryani' AND product_variants.name = 'Standard';"
```

```bash
psql "$DATABASE_URL" -c "UPDATE product_variants SET price = 1299 FROM products WHERE product_variants.\"productId\" = products.id AND products.name = 'Margherita' AND product_variants.name = '10\"';"
```

```bash
psql "$DATABASE_URL" -c "UPDATE product_variants SET price = 1499 FROM products WHERE product_variants.\"productId\" = products.id AND products.name = 'Margherita' AND product_variants.name = '12\"';"
```

```bash
psql "$DATABASE_URL" -c "UPDATE product_variants SET price = 1299 FROM products WHERE product_variants.\"productId\" = products.id AND products.name = 'Pepperoni Pizza' AND product_variants.name = '10\"';"
```

```bash
psql "$DATABASE_URL" -c "UPDATE product_variants SET price = 1499 FROM products WHERE product_variants.\"productId\" = products.id AND products.name = 'Pepperoni Pizza' AND product_variants.name = '12\"';"
```

```bash
psql "$DATABASE_URL" -c "UPDATE product_variants SET price = 1299 FROM products WHERE product_variants.\"productId\" = products.id AND products.name = 'Chicken Tikka Pizza' AND product_variants.name = '10\"';"
```

```bash
psql "$DATABASE_URL" -c "UPDATE product_variants SET price = 1499 FROM products WHERE product_variants.\"productId\" = products.id AND products.name = 'Chicken Tikka Pizza' AND product_variants.name = '12\"';"
```

```bash
psql "$DATABASE_URL" -c "UPDATE product_variants SET price = 1299 FROM products WHERE product_variants.\"productId\" = products.id AND products.name = 'Vegetarian Supreme' AND product_variants.name = '10\"';"
```

```bash
psql "$DATABASE_URL" -c "UPDATE product_variants SET price = 1499 FROM products WHERE product_variants.\"productId\" = products.id AND products.name = 'Vegetarian Supreme' AND product_variants.name = '12\"';"
```

```bash
psql "$DATABASE_URL" -c "UPDATE product_variants SET price = 1299 FROM products WHERE product_variants.\"productId\" = products.id AND products.name = 'Afghan Special Pizza (Lamb & Chilli)' AND product_variants.name = '10\"';"
```

```bash
psql "$DATABASE_URL" -c "UPDATE product_variants SET price = 1499 FROM products WHERE product_variants.\"productId\" = products.id AND products.name = 'Afghan Special Pizza (Lamb & Chilli)' AND product_variants.name = '12\"';"
```

```bash
psql "$DATABASE_URL" -c "UPDATE product_variants SET price = 199 FROM products WHERE product_variants.\"productId\" = products.id AND products.name = 'Chips' AND product_variants.name = 'Standard';"
```

```bash
psql "$DATABASE_URL" -c "UPDATE product_variants SET price = 299 FROM products WHERE product_variants.\"productId\" = products.id AND products.name = 'Garlic Bread' AND product_variants.name = 'Standard';"
```

```bash
psql "$DATABASE_URL" -c "UPDATE product_variants SET price = 499 FROM products WHERE product_variants.\"productId\" = products.id AND products.name = 'Spicy Wings (6pcs)' AND product_variants.name = 'Standard';"
```

## After Updates

Restart the application:
```bash
pm2 restart nomad-stop
```

## Alternative: Use Admin Panel

If SQL continues to fail, update prices through the admin panel at `/admin` - it's slower but more reliable.

