import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Pizza size variants: 7", 10", 12", 14"
// Prices in pence (multiply by 100)
const PIZZA_SIZES = [
  { name: '7"', price: 799 },   // £7.99
  { name: '10"', price: 999 },  // £9.99
  { name: '12"', price: 1199 }, // £11.99
  { name: '14"', price: 1399 },  // £13.99
];

async function fixPizzaSizes() {
  console.log('🍕 Fixing pizza sizes...\n');

  try {
    // Get all pizza products
    const pizzas = await prisma.product.findMany({
      where: {
        category: 'Pizza',
      },
      include: {
        variants: true,
      },
    });

    console.log(`Found ${pizzas.length} pizza products\n`);

    for (const pizza of pizzas) {
      console.log(`Updating: ${pizza.name}`);

      // Delete existing variants
      await prisma.variant.deleteMany({
        where: {
          productId: pizza.id,
        },
      });

      // Create new variants with all sizes
      const variants = await Promise.all(
        PIZZA_SIZES.map((size) =>
          prisma.variant.create({
            data: {
              productId: pizza.id,
              name: size.name,
              price: size.price,
            },
          })
        )
      );

      console.log(`  ✅ Created ${variants.length} size variants:`);
      variants.forEach((v) => {
        console.log(`     - ${v.name}: £${(v.price / 100).toFixed(2)}`);
      });
      console.log('');
    }

    console.log('✅ All pizzas updated with size variants!');
  } catch (error) {
    console.error('❌ Error updating pizza sizes:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixPizzaSizes();

