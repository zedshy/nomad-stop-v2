import { NextRequest, NextResponse } from 'next/server';
import { MOCK_PRODUCTS } from '@/lib/mockMenu';

const DISABLE_DB = process.env.DISABLE_DB === 'true';

export async function GET(request: NextRequest) {
  let prisma: import('@prisma/client').PrismaClient | null = null;

  try {
    if (DISABLE_DB) {
      // Return mock products when DB is disabled
      return NextResponse.json(MOCK_PRODUCTS);
    }

    const { PrismaClient } = await import('@prisma/client');
    prisma = new PrismaClient();

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

    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch menu products:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // If table doesn't exist or connection fails, return mock data
    if (errorMessage.includes('table') && errorMessage.includes('does not exist')) {
      console.warn('Product table does not exist yet. Returning mock data. Run migrations: npx prisma migrate deploy');
    }
    
    // Return mock products on error so menu can still be displayed
    return NextResponse.json(MOCK_PRODUCTS);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

