import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Simplified menu update - processes in small batches to avoid memory issues
 */

async function updatePrice(productName: string, variantName: string, newPricePence: number) {
  try {
    const product = await prisma.product.findFirst({
      where: { name: productName },
      include: { variants: true },
    });

    if (!product) {
      console.log(`⚠️  Not found: ${productName}`);
      return false;
    }

    const variant = product.variants.find((v) => v.name === variantName);
    if (!variant) {
      console.log(`⚠️  Variant not found: ${productName} - ${variantName}`);
      return false;
    }

    await prisma.productVariant.update({
      where: { id: variant.id },
      data: { price: newPricePence },
    });

    console.log(`✅ ${productName} - ${variantName}: £${(newPricePence / 100).toFixed(2)}`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating ${productName}:`, error);
    return false;
  }
}

async function main() {
  console.log('🔄 Updating menu prices (simplified)...\n');

  // Update prices in small batches
  const updates = [
    ['Kabuli Pilau (Lamb Shank)', 'Standard', 1495],
    ['Mantu', 'Standard', 1195],
    ['Lamb Karahi', 'Standard', 1095],
    ['Chicken Karahi', 'Mild', 995],
    ['Chicken Karahi', 'Spicy', 995],
    ['Lamb Biryani', 'Standard', 1195],
    ['Chicken Biryani', 'Standard', 1095],
    ['Chips', 'Standard', 199],
    ['Garlic Bread', 'Standard', 299],
    ['Spicy Wings (6pcs)', 'Standard', 499],
  ];

  for (const [name, variant, price] of updates) {
    await updatePrice(name, variant, price);
    // Small delay to avoid overwhelming
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Update Doner to Medium/Large
  console.log('\n🔄 Updating Doner variants...\n');
  
  const donerProducts = [
    { name: 'Lamb Doner', medium: 799, large: 999 },
    { name: 'Chicken Doner', medium: 799, large: 999 },
    { name: 'Mixed Doner', medium: 899, large: 1099 },
  ];

  for (const doner of donerProducts) {
    try {
      const product = await prisma.product.findFirst({
        where: { name: doner.name },
        include: { variants: true },
      });

      if (product) {
        await prisma.productVariant.deleteMany({
          where: { productId: product.id },
        });

        await prisma.productVariant.createMany({
          data: [
            { productId: product.id, name: 'Medium', price: doner.medium },
            { productId: product.id, name: 'Large', price: doner.large },
          ],
        });

        console.log(`✅ ${doner.name}: Medium £${(doner.medium / 100).toFixed(2)} / Large £${(doner.large / 100).toFixed(2)}`);
      }
    } catch (error) {
      console.error(`❌ Error updating ${doner.name}:`, error);
    }
  }

  // Update Pizza prices
  console.log('\n🔄 Updating Pizza prices...\n');
  
  const pizzaUpdates = [
    ['Margherita', '10"', 1299],
    ['Margherita', '12"', 1499],
    ['Pepperoni Pizza', '10"', 1299],
    ['Pepperoni Pizza', '12"', 1499],
    ['Chicken Tikka Pizza', '10"', 1299],
    ['Chicken Tikka Pizza', '12"', 1499],
    ['Vegetarian Supreme', '10"', 1299],
    ['Vegetarian Supreme', '12"', 1499],
    ['Afghan Special Pizza (Lamb & Chilli)', '10"', 1299],
    ['Afghan Special Pizza (Lamb & Chilli)', '12"', 1499],
  ];

  for (const [name, variant, price] of pizzaUpdates) {
    await updatePrice(name, variant, price);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n✅ Price updates complete!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


