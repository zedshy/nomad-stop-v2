import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📋 Current Menu Prices\n');
  console.log('='.repeat(80));

  const products = await prisma.product.findMany({
    include: {
      variants: {
        orderBy: { price: 'asc' },
      },
      addons: true,
    },
    orderBy: [
      { category: 'asc' },
      { name: 'asc' },
    ],
  });

  let currentCategory = '';

  for (const product of products) {
    if (product.category !== currentCategory) {
      currentCategory = product.category;
      console.log(`\n📁 ${currentCategory}`);
      console.log('-'.repeat(80));
    }

    const popularBadge = product.popular ? ' ⭐' : '';
    console.log(`\n${product.name}${popularBadge}`);
    
    if (product.description) {
      console.log(`   ${product.description}`);
    }

    if (product.variants.length > 0) {
      console.log('   Prices:');
      for (const variant of product.variants) {
        const priceInPounds = (variant.price / 100).toFixed(2);
        console.log(`     - ${variant.name}: £${priceInPounds} (ID: ${variant.id})`);
      }
    } else {
      console.log('   ⚠️  No prices set');
    }

    if (product.addons.length > 0) {
      console.log('   Addons:');
      for (const addon of product.addons) {
        const priceInPounds = (addon.price / 100).toFixed(2);
        console.log(`     - ${addon.name}: £${priceInPounds}`);
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\nTotal products: ${products.length}`);
  console.log(`Total variants: ${products.reduce((sum, p) => sum + p.variants.length, 0)}`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


