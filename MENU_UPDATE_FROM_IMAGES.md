# Menu Update from New Menu Images

This guide explains how to update the menu database with prices and items from the new menu images.

## Overview

The script `scripts/update-menu-from-images.ts` will:
1. ✅ Update existing product prices
2. ✅ Add new products from the menu
3. ✅ Update variants (e.g., Doner now has Medium/Large instead of Standard)
4. ✅ Add new pizza sizes (7" and 14") to existing pizzas
5. ✅ Add new pizza types (Nomad Special, Nomad Torch, Hot Chicken, etc.)

## Running the Update

### Prerequisites
- Make sure you have a `.env` file with a valid `DATABASE_URL`
- Ensure the database is accessible

### Steps

1. **Review the changes** (optional):
   ```bash
   npm run menu:update
   ```
   This will show you what will be updated before making changes.

2. **Run the update**:
   ```bash
   npm run menu:update
   ```

The script will:
- Update prices for existing items
- Convert Doner items to Medium/Large variants
- Add 7" and 14" sizes to existing pizzas
- Update pizza prices to new rates
- Add all new products from the menu images

## What Gets Updated

### Price Updates
- **Afghan Specials**: Kabuli Pilau (£14.95), Mantu (£11.95), Lamb Karahi (£10.95), Chicken Karahi (£9.95), Biryanis
- **Pizza**: All 10" pizzas → £12.99, all 12" pizzas → £14.99
- **Sides**: Chips (£1.99), Garlic Bread (£2.99), Spicy Wings (£4.99)
- **Drinks**: Soft drinks (£1.49)

### Variant Changes
- **Doner**: Changed from "Standard" to "Medium" and "Large" variants
  - Lamb Doner: Medium £7.99, Large £9.99
  - Chicken Doner: Medium £7.99, Large £9.99
  - Mixed Doner: Medium £8.99, Large £10.99
- **Grill Items**: Chicken Tikka, Lamb Tikka, Lamb Kofta, Chicken Kofta now have Medium/Large options
- **Pizza**: Added 7" (£7.99) and 14" (£16.99) sizes to all existing pizzas

### New Products Added

#### Afghan Specials
- Lamb Charsi Karahi (0.5kg) - £22.95
- Chapli Kebab - £14.95
- Lamb Keema - £9.95
- Lamb Saag - £10.95
- Chicken Saag - £9.95
- Karahi or Saag Paneer - £8.95
- Red Kidney Beans - £6.95
- Chickpeas Curry - £6.95
- Okra - £7.95
- Chilli Paneer - £8.95

#### Pasta
- Spaghetti Bolognese - £7.99
- Beef Lasagne - £7.99
- Veggie Lasagne - £7.99
- Chicken & Mushroom Pasta - £7.99

#### Wraps
- Halloumi Wrap - £8.99 / Meal £11.49
- Paneer Tikka Wrap - £8.99 / Meal £11.49
- Lamb Tikka Wrap - £9.99 / Meal £12.49
- Chicken Tikka Wrap - £9.99 / Meal £12.49
- Chicken Kofta Wrap - £7.99 / Meal £10.49
- Lamb Kofta Wrap - £7.99 / Meal £10.49

#### Rice
- Kabuli Pilau Rice - £5.99
- Egg Fried Rice - £4.99
- Plain Rice - £3.50

#### Grill
- Mix Grill (Large) - £34.95
- Lamb Tikka - Medium £11.95 / Large £15.95
- Lamb Kofta - Medium £9.95 / Large £13.95
- Chicken Kofta - Medium £9.95 / Large £13.95
- Paneer Tikka - Medium £7.95 / Large £10.95
- Chicken Wings (8 pcs) - £7.95
- Quarter Chicken with Kabuli Pilau Rice - £7.95

#### Burgers
- Beef Burger - £4.99 / Meal £7.49
- Chicken Burger - £4.99 / Meal £7.49
- Fish Burger - £3.99 / Meal £6.49
- Veggie Burger - £3.99 / Meal £6.49

#### New Pizza Types
- Nomad Special - 7" £7.99, 10" £12.99, 12" £14.99, 14" £16.99
- Nomad Torch - 7" £7.99, 10" £12.99, 12" £14.99, 14" £16.99
- Hot Chicken Pizza - 7" £7.99, 10" £12.99, 12" £14.99, 14" £16.99
- Meat Feast - 7" £7.99, 10" £12.99, 12" £14.99, 14" £16.99
- Barbeque Feast - 7" £7.99, 10" £12.99, 12" £14.99, 14" £16.99
- Original Barbeque - 7" £7.99, 10" £12.99, 12" £14.99, 14" £16.99
- Mexicana - 7" £7.99, 10" £12.99, 12" £14.99, 14" £16.99
- Hawaiian - 7" £7.99, 10" £12.99, 12" £14.99, 14" £16.99
- Vegetarian Pizza - 7" £7.99, 10" £12.99, 12" £14.99, 14" £16.99
- Vegetarian Hot Pizza - 7" £7.99, 10" £12.99, 12" £14.99, 14" £16.99

#### Sides
- Jalapeno Poppers (5 pcs) - £4.99
- Cheesy Garlic Bread (4 pcs) - £3.99
- Mozzarella Sticks (6 pcs) - £4.99
- Onion Rings (10 pcs) - £4.49
- Potato Wedges - £3.99
- Curly Fries - £4.99
- Chicken Goujons (6 pcs) - £4.99
- Chicken Nuggets (6 pcs) - £3.99
- Barbeque Wings (6 pcs) - £4.99
- Plain Naan or Butter Naan - £1.99
- Garlic Naan or Garlic Chilli Naan - £2.49
- Keema Naan - £4.99
- Plain Yoghurt - £2.49
- Aubergine Raita - £3.49

#### Desserts
- Ben & Jerry's Ice Cream - £7.99
- Haagen Dazs Ice Cream - £7.99
- Cakes - £3.99
- Cookie Churros (4 pcs) - £4.99
- Warm Cookies (4 pcs) - £4.99
- Gulab Jamun (2 pcs) - £4.99
- Ras Malai (2 pcs) - £4.99

#### Drinks
- Glass Soft Drink (330ml) - £2.99
- Large Bottle Soft Drink (1.25l) - £3.99
- Red Bull - £2.49
- Mango Lassi - £3.99
- Ayran - £1.49

## Verification

After running the update, you can verify the changes:

```bash
npm run prices:list
```

This will show all current prices in the database.

## Notes

- The script is idempotent - it checks if products already exist before adding them
- If a product or variant is not found, it will log a warning and continue
- All prices are stored in pence (e.g., £14.95 = 1495 pence)
- The script will show a summary of what was updated at the end

## Troubleshooting

If you encounter errors:
1. Check your `DATABASE_URL` in `.env`
2. Ensure the database is accessible
3. Check that Prisma client is generated: `npx prisma generate`
4. Review the error messages in the console output

