import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

/**
 * Parse Price Updates from Text File
 * 
 * This script reads a text file with price updates in the format:
 * Product Name | Variant Name | New Price
 * 
 * Example:
 * Kabuli Pilau (Lamb Shank) | Standard | 15.99
 * Chicken Biryani | Standard | 10.99
 */

interface PriceUpdate {
  productName: string;
  variantName: string;
  newPrice: number;
}

function parsePriceFile(filePath: string): PriceUpdate[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const updates: PriceUpdate[] = [];

  for (const line of lines) {
    // Skip comments and empty lines
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    // Parse format: Product Name | Variant Name | Price
    const parts = trimmed.split('|').map(p => p.trim());
    
    if (parts.length === 3) {
      const productName = parts[0];
      const variantName = parts[1];
      const priceStr = parts[2];

      if (productName && variantName && priceStr) {
        const price = parseFloat(priceStr);
        if (!isNaN(price) && price > 0) {
          updates.push({
            productName,
            variantName,
            newPrice: price,
          });
        }
      }
    }
  }

  return updates;
}

async function main() {
  const filePath = process.argv[2] || path.join(__dirname, '../price-updates.txt');

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    console.log('\nUsage:');
    console.log('  npm run prices:parse <path-to-price-file.txt>');
    console.log('\nOr create a file called "price-updates.txt" in the project root.');
    process.exit(1);
  }

  console.log(`📄 Reading price updates from: ${filePath}\n`);

  const updates = parsePriceFile(filePath);

  if (updates.length === 0) {
    console.log('⚠️  No valid price updates found in the file.');
    console.log('Expected format: Product Name | Variant Name | New Price');
    process.exit(0);
  }

  console.log(`Found ${updates.length} price update(s):\n`);
  for (const update of updates) {
    console.log(`  ${update.productName} - ${update.variantName}: £${update.newPrice.toFixed(2)}`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('\nUpdating prices...\n');

  const results: Array<{
    success: boolean;
    productName: string;
    variantName: string;
    oldPrice?: number;
    newPrice: number;
    error?: string;
  }> = [];

  for (const update of updates) {
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


