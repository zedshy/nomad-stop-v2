import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking current prices in database...\n');
  
  const products = await prisma.product.findMany({
    where: {
      name: {
        in: [
          'Kabuli Pilau (Lamb Shank)',
          'Mantu',
          'Lamb Biryani',
          'Chicken Biryani',
          'Lamb Karahi',
          'Chicken Karahi',
          'Margherita',
          'Chips',
          'Garlic Bread',
          'Spicy Wings (6pcs)',
        ],
      },
    },
    include: {
      variants: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  console.log('Current Prices:\n');
  for (const product of products) {
    for (const variant of product.variants) {
      const price = (variant.price / 100).toFixed(2);
      console.log(`${product.name} - ${variant.name}: £${price}`);
    }
  }
  
  console.log('\n✅ Price check complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());


