#!/bin/bash

# Fix missing columns in database
# This script manually adds any missing columns that should exist

echo "Checking and fixing missing columns..."

# Connect to database and add missing columns
psql $DATABASE_URL << EOF
-- Add isRequired to addons if it doesn't exist
DO \$\$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'addons' AND column_name = 'isRequired'
    ) THEN
        ALTER TABLE "addons" ADD COLUMN "isRequired" BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added isRequired column to addons table';
    ELSE
        RAISE NOTICE 'isRequired column already exists in addons table';
    END IF;
END
\$\$;

-- Add mealDrinkCategory to products if it doesn't exist (replacing mealDrinks)
DO \$\$
BEGIN
    -- First check if mealDrinks exists and rename it if needed
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'mealDrinks'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'mealDrinkCategory'
    ) THEN
        ALTER TABLE "products" RENAME COLUMN "mealDrinks" TO "mealDrinkCategory";
        ALTER TABLE "products" ALTER COLUMN "mealDrinkCategory" TYPE VARCHAR USING NULL;
        RAISE NOTICE 'Renamed mealDrinks to mealDrinkCategory';
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'mealDrinkCategory'
    ) THEN
        ALTER TABLE "products" ADD COLUMN "mealDrinkCategory" VARCHAR;
        RAISE NOTICE 'Added mealDrinkCategory column to products table';
    ELSE
        RAISE NOTICE 'mealDrinkCategory column already exists in products table';
    END IF;
END
\$\$;

-- Add isMeal if it doesn't exist
DO \$\$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'isMeal'
    ) THEN
        ALTER TABLE "products" ADD COLUMN "isMeal" BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added isMeal column to products table';
    ELSE
        RAISE NOTICE 'isMeal column already exists in products table';
    END IF;
END
\$\$;

EOF

echo "Done! Columns checked and fixed."

