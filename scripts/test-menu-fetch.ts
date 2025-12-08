import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Testing what the menu page would fetch...\n');
  
  // Check DISABLE_DB
  const disableDb = process.env.DISABLE_DB === 'true';
  console.log(`DISABLE_DB: ${disableDb}`);
  
  if (disableDb) {
    console.log('⚠️  DISABLE_DB is set to true - app will use mock data!');
    return;
  }
  
  // Try to fetch products like the menu page does
  try {
    const products = await prisma.product.findMany({
      where: {
        name: {
          in: [
            'Kabuli Pilau (Lamb Shank)',
            'Mantu',
            'Lamb Biryani',
            'Chicken Biryani',
          ],
        },
      },
      include: {
        variants: true,
      },
      orderBy: {
        category: 'asc',
      },
    });
    
    console.log(`\n✅ Successfully fetched ${products.length} products from database:\n`);
    
    for (const product of products) {
      for (const variant of product.variants) {
        const price = (variant.price / 100).toFixed(2);
        console.log(`${product.name} - ${variant.name}: £${price}`);
      }
    }
    
    console.log('\n✅ Database connection is working!');
  } catch (error) {
    console.error('\n❌ Error fetching from database:');
    console.error(error);
    console.log('\n⚠️  This would cause the app to fall back to mock data!');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

