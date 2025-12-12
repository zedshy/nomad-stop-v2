# Fix Phase 3 Migration Error

The migration is failing because the database is out of sync. Here's how to fix it:

## Option 1: Use Prisma Migrate Deploy (Recommended for Production)

On the VPS, run:

```bash
cd /var/www/nomad-stop

# First, manually add any missing columns
psql $DATABASE_URL -c "ALTER TABLE \"addons\" ADD COLUMN IF NOT EXISTS \"isRequired\" BOOLEAN DEFAULT false;"
psql $DATABASE_URL -c "ALTER TABLE \"products\" ADD COLUMN IF NOT EXISTS \"isMeal\" BOOLEAN DEFAULT false;"

# Check if mealDrinkCategory exists, if not add it
psql $DATABASE_URL -c "ALTER TABLE \"products\" ADD COLUMN IF NOT EXISTS \"mealDrinkCategory\" VARCHAR;"

# If mealDrinks column exists, we can drop it (it's been replaced by mealDrinkCategory)
psql $DATABASE_URL -c "ALTER TABLE \"products\" DROP COLUMN IF EXISTS \"mealDrinks\";"

# Now use migrate deploy instead of migrate dev
npx prisma migrate deploy
npx prisma generate
pm2 restart nomad-stop
```

## Option 2: Use the Fix Script

```bash
cd /var/www/nomad-stop
git pull origin main
./fix-missing-columns.sh
npx prisma migrate deploy
npx prisma generate
pm2 restart nomad-stop
```

## Option 3: Manual SQL Fix

Connect to your database and run:

```sql
-- Add missing columns
ALTER TABLE "addons" ADD COLUMN IF NOT EXISTS "isRequired" BOOLEAN DEFAULT false;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "isMeal" BOOLEAN DEFAULT false;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "mealDrinkCategory" VARCHAR;

-- Remove old mealDrinks column if it exists
ALTER TABLE "products" DROP COLUMN IF EXISTS "mealDrinks";
```

Then:
```bash
npx prisma migrate deploy
npx prisma generate
pm2 restart nomad-stop
```

## Why This Happened

The error occurred because:
1. `prisma migrate dev` creates new migrations and checks against a shadow database
2. The shadow database didn't have the `isRequired` column
3. On production, you should use `prisma migrate deploy` which applies existing migrations without creating new ones

## After Fixing

Once the columns are added, the app should work correctly with all Phase 3 features:
- Meal options with drink selection
- Pizza base and toppings customization

