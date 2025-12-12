-- Add notes to order items
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- Add isRequired to addons
ALTER TABLE "addons" ADD COLUMN IF NOT EXISTS "isRequired" BOOLEAN DEFAULT false;

-- Add isMeal and mealDrinks to products
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "isMeal" BOOLEAN DEFAULT false;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "mealDrinks" JSONB;

-- Add bases and toppings to product variants (for pizza customization)
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "bases" JSONB;
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "toppings" JSONB;

