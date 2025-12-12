#!/usr/bin/env node

// Fix missing columns using Prisma
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixColumns() {
  try {
    console.log('Checking and fixing missing columns...\n');

    // Check and add isRequired to addons
    try {
      await prisma.$executeRawUnsafe(`
        DO $$
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
        $$;
      `);
      console.log('✓ Checked isRequired column in addons table');
    } catch (error) {
      console.log('⚠ Error checking isRequired:', error.message);
    }

    // Check and add isMeal to products
    try {
      await prisma.$executeRawUnsafe(`
        DO $$
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
        $$;
      `);
      console.log('✓ Checked isMeal column in products table');
    } catch (error) {
      console.log('⚠ Error checking isMeal:', error.message);
    }

    // Check and add/rename mealDrinkCategory
    try {
      await prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
          -- Check if mealDrinks exists and rename it
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
        $$;
      `);
      console.log('✓ Checked mealDrinkCategory column in products table');
    } catch (error) {
      console.log('⚠ Error checking mealDrinkCategory:', error.message);
    }

    console.log('\n✅ Done! All columns checked and fixed.');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixColumns();

