import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

interface PriceUpdate {
  variantId: string;
  productName: string;
  variantName: string;
  oldPrice: number;
  newPrice: number;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function listProducts() {
  const products = await prisma.product.findMany({
    include: {
      variants: {
        orderBy: { price: 'asc' },
      },
    },
    orderBy: [
      { category: 'asc' },
      { name: 'asc' },
    ],
  });

  console.log('\n📋 Available Products:\n');
  let index = 1;
  const productMap = new Map<number, { product: typeof products[0]; variant: typeof products[0]['variants'][0] }>();

  for (const product of products) {
    for (const variant of product.variants) {
      const priceInPounds = (variant.price / 100).toFixed(2);
      console.log(`${index}. ${product.name} - ${variant.name}: £${priceInPounds} (ID: ${variant.id})`);
      productMap.set(index, { product, variant });
      index++;
    }
  }

  return productMap;
}

async function updatePrice(variantId: string, newPriceInPounds: number) {
  const newPriceInPence = Math.round(newPriceInPounds * 100);

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { product: true },
  });

  if (!variant) {
    throw new Error(`Variant with ID ${variantId} not found`);
  }

  const oldPrice = variant.price;
  
  await prisma.productVariant.update({
    where: { id: variantId },
    data: { price: newPriceInPence },
  });

  return {
    productName: variant.product.name,
    variantName: variant.name,
    oldPrice,
    newPrice: newPriceInPence,
  };
}

async function main() {
  console.log('💰 Price Update Tool\n');
  console.log('='.repeat(80));

  const updates: PriceUpdate[] = [];

  while (true) {
    const productMap = await listProducts();
    
    const choice = await question('\nEnter product number to update (or "done" to finish, "list" to refresh): ');
    
    if (choice.toLowerCase() === 'done') {
      break;
    }
    
    if (choice.toLowerCase() === 'list') {
      continue;
    }

    const productIndex = parseInt(choice);
    const selected = productMap.get(productIndex);

    if (!selected) {
      console.log('❌ Invalid selection. Please try again.');
      continue;
    }

    const currentPrice = (selected.variant.price / 100).toFixed(2);
    const newPriceInput = await question(`Current price: £${currentPrice}\nEnter new price in pounds (e.g., 12.99): `);
    
    const newPrice = parseFloat(newPriceInput);
    
    if (isNaN(newPrice) || newPrice <= 0) {
      console.log('❌ Invalid price. Please enter a valid number.');
      continue;
    }

    try {
      const result = await updatePrice(selected.variant.id, newPrice);
      updates.push({
        variantId: selected.variant.id,
        productName: result.productName,
        variantName: result.variantName,
        oldPrice: result.oldPrice,
        newPrice: result.newPrice,
      });

      console.log(`\n✅ Updated: ${result.productName} - ${result.variantName}`);
      console.log(`   Old price: £${(result.oldPrice / 100).toFixed(2)}`);
      console.log(`   New price: £${(result.newPrice / 100).toFixed(2)}\n`);
    } catch (error) {
      console.error('❌ Error updating price:', error);
    }
  }

  rl.close();

  if (updates.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('📊 Update Summary:\n');
    for (const update of updates) {
      console.log(`${update.productName} - ${update.variantName}:`);
      console.log(`  £${(update.oldPrice / 100).toFixed(2)} → £${(update.newPrice / 100).toFixed(2)}`);
    }
    console.log(`\n✅ Successfully updated ${updates.length} price(s)`);
  } else {
    console.log('\nNo prices were updated.');
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    rl.close();
  });


