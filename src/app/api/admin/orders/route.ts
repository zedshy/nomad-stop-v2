import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
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
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
