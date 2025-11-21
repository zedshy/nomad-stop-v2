import { NextResponse } from 'next/server';

const DISABLE_DB = process.env.DISABLE_DB === 'true';

export async function GET() {
  let prisma: import('@prisma/client').PrismaClient | null = null;

  try {
    if (DISABLE_DB) {
      // Return empty array when DB is disabled
      return NextResponse.json([]);
    }

    try {
      const { PrismaClient } = await import('@prisma/client');
      prisma = new PrismaClient();
    } catch (prismaError) {
      console.error('Failed to create PrismaClient:', prismaError);
      return NextResponse.json([]);
    }

    try {
      const orders = await prisma.order.findMany({
      include: {
        items: true,
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to recent orders
    });

    return NextResponse.json(orders);
    } catch (queryError) {
      console.error('Failed to query orders:', queryError);
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // If table doesn't exist, return empty array (migrations haven't been run yet)
    if (errorMessage.includes('table') && errorMessage.includes('does not exist')) {
      console.warn('Order table does not exist yet. Run migrations: npx prisma migrate deploy');
      return NextResponse.json([]);
    }
    
    // Return empty array on any other error to prevent frontend crashes
    return NextResponse.json([]);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}
