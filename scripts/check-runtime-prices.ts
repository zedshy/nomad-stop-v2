import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking what prices the website would show...\n');
  
  // Check DISABLE_DB
  const disableDb = process.env.DISABLE_DB === 'true';
  console.log(`DISABLE_DB: ${disableDb}`);
  console.log(`DATABASE_URL exists: ${!!process.env.DATABASE_URL}`);
  
  if (disableDb) {
    console.log('\n⚠️  DISABLE_DB is true - website will use MOCK data!');
    console.log('This is why you see old prices!');
    return;
  }
  
  if (!process.env.DATABASE_URL) {
    console.log('\n⚠️  DATABASE_URL not set - website will use MOCK data!');
    return;
  }
  
  // Fetch products exactly like the menu page does
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: true,
      },
      orderBy: {
        category: 'asc',
      },
    });
    
    console.log(`\n✅ Fetched ${products.length} products from database\n`);
    
    // Show Karahi prices (from the screenshot)
    const karahiProducts = products.filter(p => p.category === 'Karahi');
    console.log('Karahi Products:');
    for (const product of karahiProducts) {
      for (const variant of product.variants) {
        const price = (variant.price / 100).toFixed(2);
        console.log(`  ${product.name} - ${variant.name}: £${price}`);
      }
    }
    
    // Show Afghan Specials prices
    const afghanProducts = products.filter(p => p.category === 'Afghan Specials');
    console.log('\nAfghan Specials Products:');
    for (const product of afghanProducts.slice(0, 5)) {
      for (const variant of product.variants) {
        const price = (variant.price / 100).toFixed(2);
        console.log(`  ${product.name} - ${variant.name}: £${price}`);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error fetching from database:');
    console.error(error);
    console.log('\n⚠️  This would cause the website to fall back to MOCK data!');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());


