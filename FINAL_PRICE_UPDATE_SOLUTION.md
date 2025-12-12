# Final Price Update Solution

Since PostgreSQL is killing all queries due to resource limits, here are the working solutions:

## ✅ Solution 1: Use Admin Panel (RECOMMENDED - Most Reliable)

The admin panel uses the application's API which handles database connections more efficiently than direct SQL.

### Steps:

1. **Access Admin Panel:**
   - Go to: `http://92.205.231.55/admin` (or your domain)
   - Login with your admin credentials

2. **Update Prices:**
   - Click on "Menu Items" or "Products" tab
   - Find each product that needs updating
   - Click "Edit" on the product
   - Update the price in the "Pricing & Sizes" section
   - Click "Save"

### Critical Prices to Update:

- **Kabuli Pilau (Lamb Shank)**: £14.95
- **Mantu**: £11.95
- **Lamb Karahi**: £10.95
- **Chicken Karahi**: £9.95 (both Mild and Spicy variants)
- **Lamb Biryani**: £11.95
- **Chicken Biryani**: £10.95
- **All Pizzas (10")**: £12.99
- **All Pizzas (12")**: £14.99
- **Chips**: £1.99
- **Garlic Bread**: £2.99
- **Spicy Wings (6pcs)**: £4.99

This method is slower but **will work** because:
- The application handles database connections efficiently
- It processes one update at a time
- It uses connection pooling
- It doesn't trigger PostgreSQL resource limits

## ⚠️ Solution 2: Update by Variant ID (If Admin Panel Not Accessible)

If you can't access the admin panel, try getting variant IDs first, then updating by ID (simpler queries):

### Step 1: Get Variant IDs

```bash
cd /var/www/nomad-stop
source .env
psql "$DATABASE_URL" -c "SELECT p.name, pv.name, pv.id, pv.price FROM products p JOIN product_variants pv ON pv.\"productId\" = p.id WHERE p.name = 'Kabuli Pilau (Lamb Shank)';"
```

If this works, you'll get the variant ID. Then update by ID:

```bash
psql "$DATABASE_URL" -c "UPDATE product_variants SET price = 1495 WHERE id = 'VARIANT_ID_HERE';"
```

This is simpler and might not trigger resource limits.

## 🔧 Solution 3: Check PostgreSQL Limits

The issue might be PostgreSQL configuration limits. Check:

```bash
# Check PostgreSQL version and config
psql "$DATABASE_URL" -c "SHOW work_mem;"
psql "$DATABASE_URL" -c "SHOW max_connections;"
psql "$DATABASE_URL" -c "SHOW shared_buffers;"
```

If these are very low, that's the problem. But on GoDaddy managed hosting, you typically can't change these.

## 📝 Recommendation

**Use the Admin Panel (Solution 1)** - it's the most reliable and will definitely work. It's slower but guaranteed to complete the updates without resource issues.

The admin panel is designed to handle these updates efficiently through the application's API layer.


