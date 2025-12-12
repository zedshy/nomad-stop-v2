import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Minimal script - just critical price updates using raw SQL
async function main() {
  console.log('Updating prices...\n');

  // Use raw SQL to avoid loading data into memory
  await prisma.$executeRaw`
    UPDATE product_variants SET price = 1495 
    WHERE id IN (
      SELECT pv.id FROM product_variants pv
      JOIN products p ON pv."productId" = p.id
      WHERE p.name = 'Kabuli Pilau (Lamb Shank)' AND pv.name = 'Standard'
    )
  `;
  console.log('✅ Kabuli Pilau updated');

  await prisma.$executeRaw`
    UPDATE product_variants SET price = 1195 
    WHERE id IN (
      SELECT pv.id FROM product_variants pv
      JOIN products p ON pv."productId" = p.id
      WHERE p.name = 'Mantu' AND pv.name = 'Standard'
    )
  `;
  console.log('✅ Mantu updated');

  await prisma.$executeRaw`
    UPDATE product_variants SET price = 1095 
    WHERE id IN (
      SELECT pv.id FROM product_variants pv
      JOIN products p ON pv."productId" = p.id
      WHERE p.name = 'Lamb Karahi' AND pv.name = 'Standard'
    )
  `;
  console.log('✅ Lamb Karahi updated');

  await prisma.$executeRaw`
    UPDATE product_variants SET price = 995 
    WHERE id IN (
      SELECT pv.id FROM product_variants pv
      JOIN products p ON pv."productId" = p.id
      WHERE p.name = 'Chicken Karahi' AND pv.name IN ('Mild', 'Spicy')
    )
  `;
  console.log('✅ Chicken Karahi updated');

  await prisma.$executeRaw`
    UPDATE product_variants SET price = 1195 
    WHERE id IN (
      SELECT pv.id FROM product_variants pv
      JOIN products p ON pv."productId" = p.id
      WHERE p.name = 'Lamb Biryani' AND pv.name = 'Standard'
    )
  `;
  console.log('✅ Lamb Biryani updated');

  await prisma.$executeRaw`
    UPDATE product_variants SET price = 1095 
    WHERE id IN (
      SELECT pv.id FROM product_variants pv
      JOIN products p ON pv."productId" = p.id
      WHERE p.name = 'Chicken Biryani' AND pv.name = 'Standard'
    )
  `;
  console.log('✅ Chicken Biryani updated');

  await prisma.$executeRaw`
    UPDATE product_variants SET price = 1299 
    WHERE id IN (
      SELECT pv.id FROM product_variants pv
      JOIN products p ON pv."productId" = p.id
      WHERE p.name IN ('Margherita', 'Pepperoni Pizza', 'Chicken Tikka Pizza', 'Vegetarian Supreme', 'Afghan Special Pizza (Lamb & Chilli)')
      AND pv.name = '10"'
    )
  `;
  console.log('✅ Pizza 10" updated');

  await prisma.$executeRaw`
    UPDATE product_variants SET price = 1499 
    WHERE id IN (
      SELECT pv.id FROM product_variants pv
      JOIN products p ON pv."productId" = p.id
      WHERE p.name IN ('Margherita', 'Pepperoni Pizza', 'Chicken Tikka Pizza', 'Vegetarian Supreme', 'Afghan Special Pizza (Lamb & Chilli)')
      AND pv.name = '12"'
    )
  `;
  console.log('✅ Pizza 12" updated');

  await prisma.$executeRaw`
    UPDATE product_variants SET price = 199 
    WHERE id IN (
      SELECT pv.id FROM product_variants pv
      JOIN products p ON pv."productId" = p.id
      WHERE p.name = 'Chips' AND pv.name = 'Standard'
    )
  `;
  console.log('✅ Chips updated');

  await prisma.$executeRaw`
    UPDATE product_variants SET price = 299 
    WHERE id IN (
      SELECT pv.id FROM product_variants pv
      JOIN products p ON pv."productId" = p.id
      WHERE p.name = 'Garlic Bread' AND pv.name = 'Standard'
    )
  `;
  console.log('✅ Garlic Bread updated');

  await prisma.$executeRaw`
    UPDATE product_variants SET price = 499 
    WHERE id IN (
      SELECT pv.id FROM product_variants pv
      JOIN products p ON pv."productId" = p.id
      WHERE p.name = 'Spicy Wings (6pcs)' AND pv.name = 'Standard'
    )
  `;
  console.log('✅ Spicy Wings updated');

  console.log('\n✅ All critical prices updated!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());


