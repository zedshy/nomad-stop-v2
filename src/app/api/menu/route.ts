import { NextRequest, NextResponse } from 'next/server';

const DISABLE_DB = process.env.DISABLE_DB === 'true';

export async function GET(request: NextRequest) {
  try {
    if (DISABLE_DB) {
      return NextResponse.json([]);
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    const products = await prisma.product.findMany({
      where: category ? { category } : undefined,
      include: {
        variants: true,
        addons: true,
      },
      orderBy: [
        { category: 'asc' },
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    await prisma.$disconnect();

    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch menu products:', error);
    return NextResponse.json([], { status: 500 });
  }
}

