import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Update all prices from new menu images
 * Runs updates one at a time to avoid database overload
 */

interface PriceUpdate {
  productName: string;
  variantName: string;
  newPrice: number; // in pence
}

const priceUpdates: PriceUpdate[] = [
  // Afghan Specials
  { productName: 'Kabuli Pilau (Lamb Shank)', variantName: 'Standard', newPrice: 1495 },
  { productName: 'Mantu', variantName: 'Standard', newPrice: 1195 },
  { productName: 'Lamb Karahi', variantName: 'Standard', newPrice: 1095 },
  { productName: 'Chicken Karahi', variantName: 'Mild', newPrice: 995 },
  { productName: 'Chicken Karahi', variantName: 'Spicy', newPrice: 995 },
  { productName: 'Lamb Biryani', variantName: 'Standard', newPrice: 1195 },
  { productName: 'Chicken Biryani', variantName: 'Standard', newPrice: 1095 },
  
  // Pizza - 10"
  { productName: 'Margherita', variantName: '10"', newPrice: 1299 },
  { productName: 'Pepperoni Pizza', variantName: '10"', newPrice: 1299 },
  { productName: 'Chicken Tikka Pizza', variantName: '10"', newPrice: 1299 },
  { productName: 'Vegetarian Supreme', variantName: '10"', newPrice: 1299 },
  { productName: 'Afghan Special Pizza (Lamb & Chilli)', variantName: '10"', newPrice: 1299 },
  
  // Pizza - 12"
  { productName: 'Margherita', variantName: '12"', newPrice: 1499 },
  { productName: 'Pepperoni Pizza', variantName: '12"', newPrice: 1499 },
  { productName: 'Chicken Tikka Pizza', variantName: '12"', newPrice: 1499 },
  { productName: 'Vegetarian Supreme', variantName: '12"', newPrice: 1499 },
  { productName: 'Afghan Special Pizza (Lamb & Chilli)', variantName: '12"', newPrice: 1499 },
  
  // Sides
  { productName: 'Chips', variantName: 'Standard', newPrice: 199 },
  { productName: 'Garlic Bread', variantName: 'Standard', newPrice: 299 },
  { productName: 'Spicy Wings (6pcs)', variantName: 'Standard', newPrice: 499 },
  
  // Grill
  { productName: 'Lamb Chops (4pcs)', variantName: 'Standard', newPrice: 1495 },
];

async function updatePrice(update: PriceUpdate): Promise<boolean> {
  try {
    const product = await prisma.product.findFirst({
      where: { name: update.productName },
      include: { variants: true },
    });

    if (!product) {
      console.log(`⚠️  Product not found: ${update.productName}`);
      return false;
    }

    const variant = product.variants.find((v) => v.name === update.variantName);
    if (!variant) {
      console.log(`⚠️  Variant not found: ${update.productName} - ${update.variantName}`);
      return false;
    }

    const oldPrice = variant.price;
    await prisma.productVariant.update({
      where: { id: variant.id },
      data: { price: update.newPrice },
    });

    console.log(`✅ ${update.productName} - ${update.variantName}: £${(oldPrice / 100).toFixed(2)} → £${(update.newPrice / 100).toFixed(2)}`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating ${update.productName}:`, error);
    return false;
  }
}

async function updateDonerVariants() {
  console.log('\n🔄 Updating Doner products to Medium/Large variants...\n');
  
  const donerUpdates = [
    { productName: 'Lamb Doner', medium: 799, large: 999 },
    { productName: 'Chicken Doner', medium: 799, large: 999 },
    { productName: 'Mixed Doner', medium: 899, large: 1099 },
  ];

  for (const doner of donerUpdates) {
    try {
      const product = await prisma.product.findFirst({
        where: { name: doner.productName },
        include: { variants: true },
      });

      if (product) {
        // Delete old variants
        await prisma.productVariant.deleteMany({
          where: { productId: product.id },
        });

        // Create new Medium and Large variants
        await prisma.productVariant.createMany({
          data: [
            { productId: product.id, name: 'Medium', price: doner.medium },
            { productId: product.id, name: 'Large', price: doner.large },
          ],
        });

        console.log(`✅ ${doner.productName}: Updated to Medium £${(doner.medium / 100).toFixed(2)} / Large £${(doner.large / 100).toFixed(2)}`);
      }
    } catch (error) {
      console.error(`❌ Error updating ${doner.productName}:`, error);
    }
  }
}

async function updateChickenTikkaVariants() {
  console.log('\n🔄 Updating Chicken Tikka to Medium/Large variants...\n');
  
  try {
    const product = await prisma.product.findFirst({
      where: { name: 'Chicken Tikka' },
      include: { variants: true },
    });

    if (product) {
      // Delete old variants
      await prisma.productVariant.deleteMany({
        where: { productId: product.id },
      });

      // Create Medium and Large
      await prisma.productVariant.createMany({
        data: [
          { productId: product.id, name: 'Medium', price: 995 },
          { productId: product.id, name: 'Large', price: 1395 },
        ],
      });

      console.log(`✅ Chicken Tikka: Updated to Medium £9.95 / Large £13.95`);
    }
  } catch (error) {
    console.error(`❌ Error updating Chicken Tikka:`, error);
  }
}

async function addPizzaSizes() {
  console.log('\n🔄 Adding 7" and 14" sizes to existing pizzas...\n');
  
  const pizzaProducts = [
    'Margherita',
    'Pepperoni Pizza',
    'Chicken Tikka Pizza',
    'Vegetarian Supreme',
    'Afghan Special Pizza (Lamb & Chilli)',
  ];

  for (const pizzaName of pizzaProducts) {
    try {
      const product = await prisma.product.findFirst({
        where: { name: pizzaName },
        include: { variants: true },
      });

      if (product) {
        const has7 = product.variants.some((v) => v.name === '7"');
        const has14 = product.variants.some((v) => v.name === '14"');

        if (!has7) {
          await prisma.productVariant.create({
            data: {
              productId: product.id,
              name: '7"',
              price: 799,
            },
          });
        }

        if (!has14) {
          await prisma.productVariant.create({
            data: {
              productId: product.id,
              name: '14"',
              price: 1699,
            },
          });
        }

        console.log(`✅ ${pizzaName}: Added 7" and 14" sizes`);
      }
    } catch (error) {
      console.error(`❌ Error updating ${pizzaName}:`, error);
    }
  }
}

async function main() {
  console.log('🔄 Updating All Prices from New Menu\n');
  console.log('='.repeat(80));
  console.log('');

  let updatedCount = 0;
  let failedCount = 0;

  // Update individual prices
  console.log('1️⃣  Updating product prices...\n');
  for (const update of priceUpdates) {
    const success = await updatePrice(update);
    if (success) {
      updatedCount++;
    } else {
      failedCount++;
    }
    // Small delay to avoid overwhelming database
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Update Doner variants
  await updateDonerVariants();
  updatedCount += 3;

  // Update Chicken Tikka variants
  await updateChickenTikkaVariants();
  updatedCount++;

  // Add pizza sizes
  await addPizzaSizes();
  updatedCount += 5;

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 Update Summary:\n');
  console.log(`✅ Prices updated: ${updatedCount}`);
  console.log(`❌ Failed: ${failedCount}`);
  console.log('\n✅ Price update complete!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

