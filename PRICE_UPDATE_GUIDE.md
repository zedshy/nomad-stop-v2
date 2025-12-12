# Price Update Guide

## Quick Start

### Step 1: List All Current Prices

First, see what prices you currently have:

**On your local machine:**
```bash
npm run prices:list
```

**On the VPS server:**
```bash
cd /var/www/nomad-stop
npm run prices:list
```

This will show you all products with their current prices organized by category.

### Step 2: Update Prices

You have two options:

#### Option A: Interactive Update (One at a time)

Run the interactive script:

```bash
npm run prices:update
```

This will:
1. Show you a numbered list of all products
2. Let you select which one to update
3. Ask for the new price
4. Update it immediately
5. Let you continue updating more items

#### Option B: Bulk Update (Multiple at once)

1. Edit the file `scripts/bulk-update-prices.ts`
2. Find the `priceUpdates` array (around line 20)
3. Add your price changes like this:

```typescript
const priceUpdates: PriceUpdate[] = [
  { productName: 'Kabuli Pilau (Lamb Shank)', variantName: 'Standard', newPrice: 15.99 },
  { productName: 'Chicken Biryani', variantName: 'Standard', newPrice: 10.99 },
  { productName: 'Lamb Karahi', variantName: 'Standard', newPrice: 13.99 },
  // Add more items here...
];
```

4. Run the script:
```bash
npm run prices:bulk
```

## Running on the Server

To update prices on your production server:

1. **SSH to your VPS:**
```bash
ssh nomadadmin@92.205.231.55
```

2. **Navigate to the app directory:**
```bash
cd /var/www/nomad-stop
```

3. **Pull latest code (if you edited bulk-update-prices.ts locally):**
```bash
git pull origin main
```

4. **List current prices:**
```bash
npm run prices:list
```

5. **Update prices:**
```bash
# Interactive mode
npm run prices:update

# OR bulk mode (after editing the script)
npm run prices:bulk
```

## Important Notes

- **Prices are stored in pence** in the database (e.g., £12.99 = 1299 pence)
- The scripts handle the conversion automatically - just enter prices in pounds
- Changes are **immediate** - no need to restart the app
- The site will show updated prices right away

## Example

If you want to update:
- Kabuli Pilau from £14.99 to £15.99
- Chicken Biryani from £9.99 to £10.99

**Using bulk update:**
1. Edit `scripts/bulk-update-prices.ts`
2. Add to the array:
```typescript
const priceUpdates: PriceUpdate[] = [
  { productName: 'Kabuli Pilau (Lamb Shank)', variantName: 'Standard', newPrice: 15.99 },
  { productName: 'Chicken Biryani', variantName: 'Standard', newPrice: 10.99 },
];
```
3. Run: `npm run prices:bulk`

**Using interactive update:**
1. Run: `npm run prices:update`
2. Enter the number for Kabuli Pilau
3. Enter new price: `15.99`
4. Enter the number for Chicken Biryani
5. Enter new price: `10.99`
6. Type "done" when finished

## Troubleshooting

If you get "Product not found" errors:
- Make sure the product name matches exactly (including capitalization and special characters)
- Run `npm run prices:list` first to see the exact names

If you get database connection errors:
- Make sure your `.env` file has the correct `DATABASE_URL`
- Check that the database is accessible


