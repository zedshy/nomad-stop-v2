import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Bulk Price Update Script
 * 
 * Edit the priceUpdates array below with the items you want to update.
 * Format: { productName: string, variantName: string, newPrice: number }
 * 
 * Prices should be in pounds (e.g., 12.99 for £12.99)
 */

interface PriceUpdate {
  productName: string;
  variantName: string;
  newPrice: number; // in pounds
}

// ============================================
// EDIT THIS ARRAY WITH YOUR PRICE CHANGES
// ============================================
const priceUpdates: PriceUpdate[] = [
  // Example:
  // { productName: 'Kabuli Pilau (Lamb Shank)', variantName: 'Standard', newPrice: 15.99 },
  // { productName: 'Chicken Biryani', variantName: 'Standard', newPrice: 10.99 },
  // Add more items here...
];

// ============================================
// DO NOT EDIT BELOW THIS LINE
// ============================================

async function main() {
  if (priceUpdates.length === 0) {
    console.log('⚠️  No price updates specified.');
    console.log('Please edit the priceUpdates array in this script with your changes.');
    process.exit(0);
  }

  console.log('💰 Bulk Price Update Tool\n');
  console.log('='.repeat(80));
  console.log(`\nUpdating ${priceUpdates.length} price(s)...\n`);

  const results: Array<{
    success: boolean;
    productName: string;
    variantName: string;
    oldPrice?: number;
    newPrice: number;
    error?: string;
  }> = [];

  for (const update of priceUpdates) {
    try {
      // Find the product
      const product = await prisma.product.findFirst({
        where: {
          name: update.productName,
        },
        include: {
          variants: true,
        },
      });

      if (!product) {
        results.push({
          success: false,
          productName: update.productName,
          variantName: update.variantName,
          newPrice: update.newPrice,
          error: 'Product not found',
        });
        continue;
      }

      // Find the variant
      const variant = product.variants.find((v) => v.name === update.variantName);

      if (!variant) {
        results.push({
          success: false,
          productName: update.productName,
          variantName: update.variantName,
          newPrice: update.newPrice,
          error: 'Variant not found',
        });
        continue;
      }

      const oldPrice = variant.price;
      const newPriceInPence = Math.round(update.newPrice * 100);

      // Update the price
      await prisma.productVariant.update({
        where: { id: variant.id },
        data: { price: newPriceInPence },
      });

      results.push({
        success: true,
        productName: update.productName,
        variantName: update.variantName,
        oldPrice,
        newPrice: newPriceInPence,
      });

      console.log(`✅ ${update.productName} - ${update.variantName}: £${(oldPrice / 100).toFixed(2)} → £${update.newPrice.toFixed(2)}`);
    } catch (error) {
      results.push({
        success: false,
        productName: update.productName,
        variantName: update.variantName,
        newPrice: update.newPrice,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      console.error(`❌ Error updating ${update.productName} - ${update.variantName}:`, error);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📊 Update Summary:\n');

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  if (successful.length > 0) {
    console.log('✅ Successfully updated:');
    for (const result of successful) {
      console.log(`   ${result.productName} - ${result.variantName}: £${((result.oldPrice || 0) / 100).toFixed(2)} → £${(result.newPrice / 100).toFixed(2)}`);
    }
  }

  if (failed.length > 0) {
    console.log('\n❌ Failed to update:');
    for (const result of failed) {
      console.log(`   ${result.productName} - ${result.variantName}: ${result.error}`);
    }
  }

  console.log(`\n✅ Total: ${successful.length} updated, ${failed.length} failed`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


