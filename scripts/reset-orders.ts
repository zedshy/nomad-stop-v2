import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetOrders() {
  try {
    console.log('🔄 Resetting all orders...');
    
    // Delete all payments first (they reference orders)
    const deletedPayments = await prisma.payment.deleteMany({});
    console.log(`✓ Deleted ${deletedPayments.count} payment(s)`);
    
    // Delete all order items (they reference orders)
    const deletedOrderItems = await prisma.orderItem.deleteMany({});
    console.log(`✓ Deleted ${deletedOrderItems.count} order item(s)`);
    
    // Delete all orders
    const deletedOrders = await prisma.order.deleteMany({});
    console.log(`✓ Deleted ${deletedOrders.count} order(s)`);
    
    console.log('\n✅ All orders have been reset!');
  } catch (error) {
    console.error('❌ Error resetting orders:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetOrders();

