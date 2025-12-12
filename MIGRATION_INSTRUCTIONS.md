# Database Migration Instructions

## New Features Added

1. **Unlimited Categories** - No longer limited to 4 categories, can add any category name
2. **Item Sorting** - Added `sortOrder` field to control display order (starters first, curries after, etc.)
3. **Item Photos** - Added `imageUrl` field to display photos on menu items

## Database Migration Required

After pulling these changes, you need to run a database migration:

```bash
# Generate migration
npx prisma migrate dev --name add_sort_order_and_image_url

# Or if on production server:
npx prisma migrate deploy
```

This will add two new fields to the `products` table:
- `sortOrder` (Int, default: 0) - Controls display order
- `imageUrl` (String, optional) - URL/path to product image

## How to Use

### 1. Categories
- In the admin panel, you can now select from existing categories OR type a new category name
- Categories are automatically saved when you create items with new category names

### 2. Display Order
- Each item has a "Display Order" field
- Lower numbers appear first (e.g., starters: 10, curries: 20, desserts: 30)
- Items are sorted by: category → sortOrder → creation date

### 3. Item Photos
- Add an image URL in the "Item Photo URL" field
- Can be:
  - Full URL: `https://example.com/image.jpg`
  - Relative path: `/images/kabuli-pilau.jpg`
- Image preview shows in the admin panel
- Images display on the menu page above each item

## Example Usage

**Starters:**
- Sort Order: 10
- Category: "Starters"

**Curries:**
- Sort Order: 20
- Category: "Curries"

**Desserts:**
- Sort Order: 30
- Category: "Desserts"

This ensures starters appear first, then curries, then desserts within each category.

